#!/bin/bash

# This script performs various checks on the codebase
# 1. Ensure Fuse.js is properly loaded in HTML files that use it
# 2. Check for proper script loading order (e.g., dependencies before their usage)
# 3. Fix quote style issues in JavaScript files (single quotes to double quotes)

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Running checks on repository at: $REPO_ROOT"

# Check dependencies without rewriting templates or reintroducing CDN scripts.
echo "Checking pinned browser dependencies..."
for layout in default history join-us team; do
  if ! grep -q 'include site-scripts.html' \
    "$REPO_ROOT/_layouts/$layout.html"; then
    echo "Missing site-scripts.html in $layout layout" >&2
    exit 1
  fi
done
if ! grep -q 'include browser-dependencies.html' \
  "$REPO_ROOT/_includes/site-scripts.html"; then
  echo "site-scripts.html must include browser-dependencies.html" >&2
  exit 1
fi
if grep -Eq 'https?://' "$REPO_ROOT/_includes/browser-dependencies.html"; then
  echo "Browser dependencies must be served from the local vendor directory" >&2
  exit 1
fi

# Fail on duplicate core script tags or invalid dependency order.
echo "Checking script includes and dependency order..."
bash "$REPO_ROOT/scripts/check-script-includes.sh"

# Fix quote style in JavaScript files (single quotes to double quotes)
echo "Checking and fixing quote style in JavaScript files..."

# Parse arguments
FIX_MODE=false
if [[ "$1" == "--fix" ]]; then
  FIX_MODE=true
  echo "Running in fix mode - will modify files"
else
  echo "Running in check-only mode (use --fix to modify files)"
fi

# Run ESLint on JavaScript files with quotes rule
JS_DIR="$REPO_ROOT/assets/js"
ESLINT_BIN="$REPO_ROOT/node_modules/.bin/eslint"

if [[ ! -x "$ESLINT_BIN" ]]; then
  echo "Local ESLint is unavailable. Run npm ci first." >&2
  exit 1
fi
if [[ "$FIX_MODE" == "true" ]]; then
  # Fix mode: run ESLint with --fix flag
  "$ESLINT_BIN" "$JS_DIR" --rule 'quotes: ["error", "double", {"avoidEscape": true}]' --fix
  if [ $? -eq 0 ]; then
    echo "Fixed quote style in JavaScript files."
  else
    echo "ESLint encountered issues while fixing quote style."
  fi
else
  # Check-only mode: run ESLint without --fix
  "$ESLINT_BIN" "$JS_DIR" --rule 'quotes: ["error", "double", {"avoidEscape": true}]'
  ESLINT_EXIT_CODE=$?
  if [ $ESLINT_EXIT_CODE -eq 0 ]; then
    echo "No quote style issues found in JavaScript files."
  else
    echo "Found quote style issues in JavaScript files (run with --fix to update)."
    exit $ESLINT_EXIT_CODE
  fi
fi

echo "Lint check completed!"
