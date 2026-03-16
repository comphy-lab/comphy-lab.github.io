#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
FAKE_BIN="$TMP_DIR/bin"
mkdir -p "$FAKE_BIN"
trap 'rm -rf "$TMP_DIR"' EXIT

cat >"$FAKE_BIN/lsof" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
arg="${*: -1}"
port="${arg##*:}"
ranges="${OCCUPIED_PORTS:-}"
IFS=',' read -r -a entries <<< "$ranges"
for entry in "${entries[@]}"; do
  [[ -z "$entry" ]] && continue
  if [[ "$entry" == *-* ]]; then
    start="${entry%-*}"
    end="${entry#*-}"
    if (( port >= start && port <= end )); then
      exit 0
    fi
  elif [[ "$port" == "$entry" ]]; then
    exit 0
  fi
done
exit 1
EOF
chmod +x "$FAKE_BIN/lsof"

cat >"$FAKE_BIN/bundle" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [[ "$#" -ge 3 && "$1" == "exec" && "$2" == "jekyll" && "$3" == "--version" ]]; then
  echo "jekyll 4.3.4"
  exit 0
fi
if [[ "$#" -ge 3 && "$1" == "exec" && "$2" == "jekyll" && "$3" == "serve" ]]; then
  printf '%s\n' "$@" > "$FAKE_BUNDLE_LOG"
  exit 0
fi
echo "unexpected bundle invocation: $*" >&2
exit 1
EOF
chmod +x "$FAKE_BIN/bundle"

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local label="$3"
  if [[ "$haystack" != *"$needle"* ]]; then
    echo "ASSERTION FAILED: $label" >&2
    echo "Expected to find: $needle" >&2
    echo "--- output ---" >&2
    printf '%s\n' "$haystack" >&2
    exit 1
  fi
}

assert_not_contains() {
  local haystack="$1"
  local needle="$2"
  local label="$3"
  if [[ "$haystack" == *"$needle"* ]]; then
    echo "ASSERTION FAILED: $label" >&2
    echo "Did not expect to find: $needle" >&2
    echo "--- output ---" >&2
    printf '%s\n' "$haystack" >&2
    exit 1
  fi
}

run_deploy() {
  local occupied_ports="$1"
  shift
  RUN_OUTPUT_FILE="$TMP_DIR/run-output.txt"
  RUN_BUNDLE_LOG="$TMP_DIR/bundle-args.txt"
  if OCCUPIED_PORTS="$occupied_ports" FAKE_BUNDLE_LOG="$RUN_BUNDLE_LOG" PATH="$FAKE_BIN:$PATH" \
      "$REPO_ROOT/scripts/deploy.sh" "$@" >"$RUN_OUTPUT_FILE" 2>&1; then
    RUN_STATUS=0
  else
    RUN_STATUS=$?
  fi
  RUN_OUTPUT="$(cat "$RUN_OUTPUT_FILE")"
  if [[ -f "$RUN_BUNDLE_LOG" ]]; then
    RUN_BUNDLE_ARGS="$(cat "$RUN_BUNDLE_LOG")"
  else
    RUN_BUNDLE_ARGS=""
  fi
}

test_livereload_port_exhaustion_does_not_abort() {
  run_deploy "35730-35999" --port 4001
  [[ "$RUN_STATUS" -eq 0 ]]
  assert_contains "$RUN_OUTPUT" "Failed to find an available livereload port. Disabling livereload." "livereload exhaustion should downgrade cleanly"
  assert_not_contains "$RUN_BUNDLE_ARGS" "--livereload" "serve command should omit livereload args when no livereload port exists"
}

test_ipv6_host_is_bracketed_for_url_display() {
  run_deploy "" --port 4001 --host fe80::1
  [[ "$RUN_STATUS" -eq 0 ]]
  assert_contains "$RUN_OUTPUT" "URL: http://[fe80::1]:4001" "bare IPv6 host should be bracketed in displayed URL"
  assert_contains "$RUN_BUNDLE_ARGS" "--host" "serve command should include host flag"
  assert_contains "$RUN_BUNDLE_ARGS" "fe80::1" "serve command should preserve bare IPv6 host value"
}

test_bracketed_ipv6_is_not_double_bracketed() {
  run_deploy "" --port 4001 --host [::1]
  [[ "$RUN_STATUS" -eq 0 ]]
  assert_contains "$RUN_OUTPUT" "URL: http://[::1]:4001" "bracketed IPv6 host should remain bracketed once"
  assert_not_contains "$RUN_OUTPUT" "http://[[::1]]:4001" "URL display must not double-bracket IPv6 host"
}

test_leading_zero_port_is_normalized() {
  run_deploy "" --port 04001
  [[ "$RUN_STATUS" -eq 0 ]]
  assert_contains "$RUN_OUTPUT" "Using custom port: 4001" "leading-zero port should normalize to decimal"
  assert_contains "$RUN_BUNDLE_ARGS" $'--port\n4001' "serve command should receive normalized port"
}

test_invalid_port_range_is_rejected() {
  run_deploy "" --port 70000
  [[ "$RUN_STATUS" -ne 0 ]]
  assert_contains "$RUN_OUTPUT" "-p|--port must be between 1 and 65535" "invalid port range should fail with a clear error"
}

main() {
  test_livereload_port_exhaustion_does_not_abort
  test_ipv6_host_is_bracketed_for_url_display
  test_bracketed_ipv6_is_not_double_bracketed
  test_leading_zero_port_is_normalized
  test_invalid_port_range_is_rejected
  echo "deploy-script regression tests passed"
}

main "$@"
