#!/usr/bin/env bash
# Regression coverage for scripts/check-script-includes.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHECK="$REPO_ROOT/scripts/check-script-includes.sh"
TMP_LAYOUT=""

cleanup() {
  if [[ -n "$TMP_LAYOUT" && -f "$TMP_LAYOUT" ]]; then
    rm -f "$TMP_LAYOUT"
  fi
}
trap cleanup EXIT

echo "1) Clean tree must pass"
bash "$CHECK"

echo "2) Duplicate main.js must fail"
TMP_LAYOUT="$REPO_ROOT/_layouts/_tmp-script-check-dup.html"
cat > "$TMP_LAYOUT" <<'EOF'
<!DOCTYPE html>
<html>
<head>
  <script defer src="/assets/js/utils.js"></script>
  <script defer src="/assets/js/main.js"></script>
  <script defer src="/assets/js/main.js"></script>
</head>
<body></body>
</html>
EOF

if bash "$CHECK" >/tmp/script-check-dup.out 2>&1; then
  echo "Expected failure for duplicate main.js" >&2
  cat /tmp/script-check-dup.out >&2
  exit 1
fi
grep -q "duplicate include of main.js" /tmp/script-check-dup.out
rm -f "$TMP_LAYOUT"
TMP_LAYOUT=""

echo "3) utils.js after command-palette.js must fail"
TMP_LAYOUT="$REPO_ROOT/_layouts/_tmp-script-check-order.html"
cat > "$TMP_LAYOUT" <<'EOF'
<!DOCTYPE html>
<html>
<head>
  <script defer src="/assets/js/command-palette.js"></script>
  <script defer src="/assets/js/utils.js"></script>
</head>
<body></body>
</html>
EOF

if bash "$CHECK" >/tmp/script-check-order.out 2>&1; then
  echo "Expected failure for utils after command-palette" >&2
  cat /tmp/script-check-order.out >&2
  exit 1
fi
grep -q "utils.js" /tmp/script-check-order.out
rm -f "$TMP_LAYOUT"
TMP_LAYOUT=""

echo "check-script-includes regression passed."
