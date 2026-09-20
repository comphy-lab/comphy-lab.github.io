#!/usr/bin/env bash
# Fail CI when layout script includes are duplicated or mis-ordered.
# Canonical stack lives in _includes/site-scripts.html.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LAYOUTS_DIR="$REPO_ROOT/_layouts"
INCLUDES_DIR="$REPO_ROOT/_includes"
SITE_SCRIPTS="$INCLUDES_DIR/site-scripts.html"

FAILURES=0

log_error() {
  echo "✗ $1" >&2
  FAILURES=$((FAILURES + 1))
}

# First 1-based line index of a script basename, or 0 if absent.
script_line() {
  local file="$1"
  local name="$2"
  local line
  line="$(grep -nE "src=\"[^\"]*/assets/js/${name}\"" "$file" 2>/dev/null \
    | head -1 | cut -d: -f1 || true)"
  if [[ -z "$line" ]]; then
    echo 0
  else
    echo "$line"
  fi
}

script_count() {
  local file="$1"
  local name="$2"
  local count
  count="$(grep -cE "src=\"[^\"]*/assets/js/${name}\"" "$file" 2>/dev/null \
    || true)"
  echo "${count:-0}"
}

require_before() {
  local file="$1"
  local earlier="$2"
  local later="$3"
  local earlier_line later_line
  earlier_line="$(script_line "$file" "$earlier")"
  later_line="$(script_line "$file" "$later")"
  if (( later_line == 0 )); then
    return 0
  fi
  if (( earlier_line == 0 )); then
    log_error "$file: $later requires $earlier to load first (missing)."
    return 0
  fi
  if (( earlier_line > later_line )); then
    log_error \
      "$file: $earlier (line $earlier_line) must load before $later (line $later_line)."
  fi
}

check_no_duplicates() {
  local file="$1"
  local name count
  for name in main.js command-palette.js; do
    count="$(script_count "$file" "$name" | tr -d '[:space:]')"
    if (( count > 1 )); then
      log_error "$file: duplicate include of $name (${count} times)."
    fi
  done
}

check_dependency_order() {
  local file="$1"

  # Utils consumers
  require_before "$file" "utils.js" "main.js"
  require_before "$file" "utils.js" "command-palette.js"
  require_before "$file" "utils.js" "command-data.js"
  require_before "$file" "utils.js" "platform-utils.js"
  require_before "$file" "utils.js" "contact-card.js"

  # SearchManager consumers
  require_before "$file" "search-manager.js" "command-palette.js"
  require_before "$file" "search-manager.js" "command-data.js"

  # Palette before data
  require_before "$file" "command-palette.js" "command-data.js"
}

# Layouts that own the head/script stack (not nested under default).
STANDALONE_LAYOUTS=(default history join-us team)

# Core scripts provided by site-scripts.html / default stack.
CORE_SCRIPTS=(
  utils.js
  search-manager.js
  command-palette.js
  main.js
  command-data.js
  platform-utils.js
)

echo "Checking layout script includes..."

if [[ ! -f "$SITE_SCRIPTS" ]]; then
  log_error "Missing canonical include: _includes/site-scripts.html"
else
  check_no_duplicates "$SITE_SCRIPTS"
  check_dependency_order "$SITE_SCRIPTS"
  if ! grep -q 'include browser-dependencies.html' "$SITE_SCRIPTS"; then
    log_error "_includes/site-scripts.html must include browser-dependencies.html"
  fi
fi

for layout in "${STANDALONE_LAYOUTS[@]}"; do
  file="$LAYOUTS_DIR/$layout.html"
  if [[ ! -f "$file" ]]; then
    log_error "Missing standalone layout: _layouts/$layout.html"
    continue
  fi
  if ! grep -q 'include site-scripts.html' "$file"; then
    log_error "_layouts/$layout.html must {% include site-scripts.html %}"
  fi
  # Standalone layouts must not also hard-code the core stack.
  for name in "${CORE_SCRIPTS[@]}"; do
    count="$(script_count "$file" "$name" | tr -d '[:space:]')"
    if (( count > 0 )); then
      log_error \
        "_layouts/$layout.html hard-codes $name; use site-scripts.html only."
    fi
  done
  check_no_duplicates "$file"
done

# Nested layouts (front matter layout: default) must not re-include core scripts.
shopt -s nullglob
for file in "$LAYOUTS_DIR"/*.html; do
  base="$(basename "$file")"
  # Skip standalone owners checked above.
  skip=false
  for layout in "${STANDALONE_LAYOUTS[@]}"; do
    if [[ "$base" == "$layout.html" ]]; then
      skip=true
      break
    fi
  done
  if [[ "$skip" == true ]]; then
    continue
  fi

  check_no_duplicates "$file"
  check_dependency_order "$file"

  parent="$(awk '
    BEGIN { in_fm=0 }
    /^---[[:space:]]*$/ {
      if (in_fm == 0) { in_fm=1; next }
      else { exit }
    }
    in_fm && /^layout:[[:space:]]*/ {
      sub(/^layout:[[:space:]]*/, "")
      gsub(/[[:space:]]/, "")
      print
      exit
    }
  ' "$file")"

  if [[ "$parent" == "default" || "$parent" == "history" \
     || "$parent" == "join-us" || "$parent" == "team" ]]; then
    for name in "${CORE_SCRIPTS[@]}" contact-card.js teaching.js; do
      count="$(script_count "$file" "$name" | tr -d '[:space:]')"
      if (( count > 0 )); then
        log_error \
          "_layouts/$base inherits $parent but also includes $name (duplicate)."
      fi
    done
  fi
done
shopt -u nullglob

# Includes other than site-scripts should not ship duplicate core tags either.
shopt -s nullglob
for file in "$INCLUDES_DIR"/*.html; do
  base="$(basename "$file")"
  if [[ "$base" == "site-scripts.html" \
     || "$base" == "browser-dependencies.html" ]]; then
    continue
  fi
  check_no_duplicates "$file"
done
shopt -u nullglob

if (( FAILURES > 0 )); then
  echo "Script include check failed with $FAILURES error(s)." >&2
  exit 1
fi

echo "Script include check passed."
