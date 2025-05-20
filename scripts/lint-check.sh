#!/bin/bash

# This script performs various checks on the codebase
# 1. Ensure Fuse.js is properly loaded in HTML files that use it
# 2. Check for proper script loading order (e.g., dependencies before their usage)
# 3. Fix quote style issues in JavaScript files (single quotes to double quotes)

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Running checks on repository at: $REPO_ROOT"

# Check for Fuse dependency
echo "Checking for proper Fuse.js loading..."
# Look for specific Fuse.js usage - not just mentions of the word "Fuse"
FILES_WITH_FUSE=$(grep -l -E "new Fuse|window.searchFuse|Fuse\.js" "$REPO_ROOT/_layouts/"*.html "$REPO_ROOT/_includes/"*.html "$REPO_ROOT/assets/js/"*.js 2>/dev/null || echo "")

if [ -n "$FILES_WITH_FUSE" ]; then
  echo "Found files using Fuse.js:"
  echo "$FILES_WITH_FUSE" | sed 's/^/- /'
  
  # JavaScript files don't need the CDN, only check HTML files
  HTML_WITH_FUSE=$(grep -l -E "new Fuse|window.searchFuse|Fuse\.js" "$REPO_ROOT/_layouts/"*.html "$REPO_ROOT/_includes/"*.html 2>/dev/null || echo "")
  
  if [ -n "$HTML_WITH_FUSE" ]; then
    for file in $HTML_WITH_FUSE; do
      if ! grep -q "cdn.jsdelivr.net/npm/fuse.js" "$file"; then
        echo "WARNING: $file uses Fuse but doesn't include the CDN. Adding it..."
        # Find the closing </head> tag and insert the Fuse CDN script before it
        sed -i '' '/<\/head>/i\
  <script defer src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"></script>
' "$file"
        echo "Fixed: Added Fuse.js CDN to $file"
      else
        echo "OK: $file properly includes Fuse.js CDN"
      fi
    done
  else
    echo "No HTML files directly using Fuse.js found."
  fi
  
  # Check if default.html includes the Fuse CDN, since it's the base template
  if ! grep -q "cdn.jsdelivr.net/npm/fuse.js" "$REPO_ROOT/_layouts/default.html" 2>/dev/null; then
    echo "Adding Fuse.js to default layout template as a fallback..."
    sed -i '' '/<\/head>/i\
  <!-- Fuse.js dependency for search functionality -->\\
  <script defer src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"></script>
' "$REPO_ROOT/_layouts/default.html"
    echo "Fixed: Added Fuse.js CDN to default layout"
  fi
else
  echo "No files using Fuse.js found."
fi

# Check for proper script loading order in HTML files
echo "Checking script loading order..."
HTML_FILES=$(find "$REPO_ROOT/_layouts" "$REPO_ROOT/_includes" -name "*.html" 2>/dev/null)

for file in $HTML_FILES; do
  # Check if command-data.js loads after command-palette.js
  if grep -q "command-data.js" "$file" && grep -q "command-palette.js" "$file"; then
    # Get first line number for each file (multiple occurrences may exist)
    DATA_LINE=$(grep -n "command-data.js" "$file" | head -1 | cut -d ":" -f 1)
    PALETTE_LINE=$(grep -n "command-palette.js" "$file" | head -1 | cut -d ":" -f 1)
    
    if [ "$PALETTE_LINE" -gt "$DATA_LINE" ]; then
      echo "WARNING: In $file, command-palette.js (line $PALETTE_LINE) loads after command-data.js (line $DATA_LINE). Check for potential dependency issues."
    fi
  fi
done

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

# Find all JavaScript files
JS_FILES=$(find "$REPO_ROOT/assets/js" -name "*.js" -type f)
FIXED_COUNT=0

for file in $JS_FILES; do
  # Create a temp file for the transformation
  tmp_file=$(mktemp)
  
  # Process the file using a simpler, more portable approach
  if [[ "$(uname)" == "Darwin" ]]; then
    # macOS (BSD sed)
    sed "s/'/\"/g" "$file" > "$tmp_file"
  else
    # Linux/GNU sed
    sed 's/'"'"'/"/g' "$file" > "$tmp_file"
  fi
  
  # Check if the file was modified
  if ! cmp -s "$file" "$tmp_file"; then
    if [[ "$FIX_MODE" == "true" ]]; then
      # Move the temp file to the original
      mv "$tmp_file" "$file"
      FIXED_COUNT=$((FIXED_COUNT + 1))
      echo "Fixed quote style in: $(basename "$file")"
    else
      echo "Would fix quote style in: $(basename "$file")"
      FIXED_COUNT=$((FIXED_COUNT + 1))
      rm "$tmp_file"
    fi
  else
    # No changes needed, remove the temp file
    rm "$tmp_file"
  fi
done

if [ $FIXED_COUNT -eq 0 ]; then
  echo "No quote style issues found in JavaScript files."
else
  if [[ "$FIX_MODE" == "true" ]]; then
    echo "Fixed quote style in $FIXED_COUNT JavaScript files."
  else
    echo "Found $FIXED_COUNT JavaScript files with quote style issues (run with --fix to update)."
  fi
fi

echo "Lint check completed!"