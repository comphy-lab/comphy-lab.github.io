#!/bin/bash

set -euo pipefail

# Script to fix quote style issues in JavaScript files
cd "$(dirname "$0")/.." || exit 1

ESLINT_BIN="./node_modules/.bin/eslint"

if [[ ! -x "$ESLINT_BIN" ]]; then
    echo "❌ Local ESLint binary not found at $ESLINT_BIN"
    echo "   Run npm install before using scripts/fix-quotes.sh."
    exit 1
fi

"$ESLINT_BIN" assets/js \
    --ext .js \
    --fix \
    --rule 'quotes:["error","double",{"avoidEscape":true,"allowTemplateLiterals":true}]'

# Let the user know we're done
echo "Quote style fixed in JavaScript files"
