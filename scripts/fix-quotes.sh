#!/bin/bash

# Script to fix quote style issues in JavaScript files
cd "$(dirname "$0")/.."

# Replace single quotes with double quotes in JavaScript files
find ./assets/js -name "*.js" -type f -exec sed -i '' "s/'[^']*'/\$(echo & | sed 's/'/\"/g')/g" {} \;

# Let the user know we're done
echo "Quote style fixed in JavaScript files"