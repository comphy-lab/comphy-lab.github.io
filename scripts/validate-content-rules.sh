#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HISTORY_FILE="$REPO_ROOT/history.md"
RESEARCH_FILE="$REPO_ROOT/_research/index.md"
ADD_NEWS_RULES_FILE="$REPO_ROOT/.opencode/commands/add-news.md"
CLAUDE_FILE="$REPO_ROOT/CLAUDE.md"
README_FILE="$REPO_ROOT/README.md"
ADD_PAPER_RULES_FILE="$REPO_ROOT/.opencode/commands/add-paper.md"

FAILURES=0

log_error() {
  echo "✗ $1"
  FAILURES=$((FAILURES + 1))
}

has_match() {
  local pattern="$1"
  local file="$2"

  if command -v rg >/dev/null 2>&1; then
    rg -q "$pattern" "$file"
  else
    grep -Eq "$pattern" "$file"
  fi
}

require_file() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    log_error "Required file not found: $file"
    return 1
  fi
}

validate_history_order() {
  if ! require_file "$HISTORY_FILE"; then
    # Missing file already counted in FAILURES; keep running other validations.
    return 0
  fi
  local previous_year=99999
  local current_year=""
  local previous_month=13

  month_to_number() {
    case "$1" in
      January) echo 1 ;;
      February) echo 2 ;;
      March) echo 3 ;;
      April) echo 4 ;;
      May) echo 5 ;;
      June) echo 6 ;;
      July) echo 7 ;;
      August) echo 8 ;;
      September) echo 9 ;;
      October) echo 10 ;;
      November) echo 11 ;;
      December) echo 12 ;;
      *) echo 0 ;;
    esac
  }

  while IFS= read -r line; do
    if [[ $line =~ ^##[[:space:]]+([0-9]{4})[[:space:]]*$ ]]; then
      local year="${BASH_REMATCH[1]}"
      if (( year >= previous_year )); then
        log_error "history.md year heading '$year' is out of order. Years must be descending."
      fi
      previous_year=$year
      current_year=$year
      previous_month=13
      continue
    fi

    if [[ $line =~ ^###[[:space:]]+([A-Za-z]+)[[:space:]]*$ ]]; then
      local month_name="${BASH_REMATCH[1]}"
      local month_number
      month_number="$(month_to_number "$month_name")"
      if (( month_number > 0 )); then
        if (( month_number >= previous_month )); then
          log_error "history.md month '$month_name' is out of order in $current_year. Months must be reverse chronological (December to January)."
        fi
        previous_month=$month_number
      fi
    fi
  done < "$HISTORY_FILE"
}

validate_research_tags() {
  if ! require_file "$RESEARCH_FILE"; then
    # Missing file already counted in FAILURES; keep running other validations.
    return 0
  fi

  if has_match "<tags>|</tags>" "$RESEARCH_FILE"; then
    log_error "_research/index.md still contains <tags> elements. Use <div class=\"tags\"> blocks."
  fi

  if ! has_match "<div class=\"tags\">" "$RESEARCH_FILE"; then
    log_error "_research/index.md is missing <div class=\"tags\"> blocks."
  fi
}

validate_docs_rules() {
  local missing_required_file=0

  require_file "$ADD_NEWS_RULES_FILE" || missing_required_file=1
  require_file "$CLAUDE_FILE" || missing_required_file=1
  require_file "$README_FILE" || missing_required_file=1
  require_file "$ADD_PAPER_RULES_FILE" || missing_required_file=1

  if (( missing_required_file > 0 )); then
    # Missing files already counted in FAILURES; skip content checks safely.
    return 0
  fi

  if ! has_match "reverse chronological order" "$ADD_NEWS_RULES_FILE"; then
    log_error ".opencode/commands/add-news.md must state reverse chronological month ordering."
  fi

  if has_match "<tags>|</tags>" "$CLAUDE_FILE"; then
    log_error "CLAUDE.md still documents deprecated <tags> markup."
  fi

  if has_match "<tags>|</tags>" "$README_FILE"; then
    log_error "README.md still documents deprecated <tags> markup."
  fi

  if has_match "<tags>|</tags>" "$ADD_PAPER_RULES_FILE"; then
    log_error ".opencode/commands/add-paper.md still documents deprecated <tags> markup."
  fi
}

validate_history_order
validate_research_tags
validate_docs_rules

if (( FAILURES > 0 )); then
  echo ""
  echo "Validation failed with $FAILURES issue(s)."
  exit 1
fi

echo "✓ Content ordering and research tag rules passed."
