#!/usr/bin/env bash
# Regression coverage for scripts/check-script-includes.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHECK="$REPO_ROOT/scripts/check-script-includes.sh"
WORKDIR="$(mktemp -d "${TMPDIR:-/tmp}/script-includes-reg.XXXXXX")"
TMP_LAYOUT=""

cleanup() {
  if [[ -n "$TMP_LAYOUT" && -f "$TMP_LAYOUT" ]]; then
    rm -f "$TMP_LAYOUT"
  fi
  rm -rf "$WORKDIR"
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

if bash "$CHECK" >"$WORKDIR/dup.out" 2>&1; then
  echo "Expected failure for duplicate main.js" >&2
  cat "$WORKDIR/dup.out" >&2
  exit 1
fi
grep -q "duplicate include of main.js" "$WORKDIR/dup.out"
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

if bash "$CHECK" >"$WORKDIR/order.out" 2>&1; then
  echo "Expected failure for utils after command-palette" >&2
  cat "$WORKDIR/order.out" >&2
  exit 1
fi
grep -q "utils.js" "$WORKDIR/order.out"
rm -f "$TMP_LAYOUT"
TMP_LAYOUT=""

echo "4) Nested layout re-including core scripts must fail"
TMP_LAYOUT="$REPO_ROOT/_layouts/_tmp-script-check-nested.html"
cat > "$TMP_LAYOUT" <<'EOF'
---
layout: default
---
<script defer src="/assets/js/main.js"></script>
EOF

if bash "$CHECK" >"$WORKDIR/nested.out" 2>&1; then
  echo "Expected failure for nested core-script include" >&2
  cat "$WORKDIR/nested.out" >&2
  exit 1
fi
grep -q "inherits a site-scripts provider" "$WORKDIR/nested.out"
rm -f "$TMP_LAYOUT"
TMP_LAYOUT=""

echo "5) Nested layout re-including site-scripts.html must fail"
TMP_LAYOUT="$REPO_ROOT/_layouts/_tmp-script-check-nested-include.html"
cat > "$TMP_LAYOUT" <<'EOF'
---
layout: default
---
{% include site-scripts.html %}
EOF

if bash "$CHECK" >"$WORKDIR/nested-inc.out" 2>&1; then
  echo "Expected failure for nested site-scripts include" >&2
  cat "$WORKDIR/nested-inc.out" >&2
  exit 1
fi
grep -q "re-includes site-scripts.html" "$WORKDIR/nested-inc.out"
rm -f "$TMP_LAYOUT"
TMP_LAYOUT=""

echo "6) Single-quoted script src must count as a duplicate"
TMP_LAYOUT="$REPO_ROOT/_layouts/_tmp-script-check-sq.html"
cat > "$TMP_LAYOUT" <<'EOF'
<!DOCTYPE html>
<html>
<head>
  <script defer src='/assets/js/main.js'></script>
  <script defer src="/assets/js/main.js"></script>
</head>
<body></body>
</html>
EOF

if bash "$CHECK" >"$WORKDIR/sq.out" 2>&1; then
  echo "Expected failure for single-quoted duplicate main.js" >&2
  cat "$WORKDIR/sq.out" >&2
  exit 1
fi
grep -q "duplicate include of main.js" "$WORKDIR/sq.out"
rm -f "$TMP_LAYOUT"
TMP_LAYOUT=""

echo "check-script-includes regression passed."
