#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REQUIRED_RUBY="$(tr -d '[:space:]' < "$REPO_ROOT/.ruby-version")"
REQUIRED_BUNDLER="$(awk '/^BUNDLED WITH$/{getline; gsub(/^[[:space:]]+/, "", $0); print; exit}' "$REPO_ROOT/Gemfile.lock")"

fail() {
  echo "❌ $1" >&2
  exit 1
}

[[ -n "$REQUIRED_RUBY" ]] || fail "Could not read required Ruby version from .ruby-version"
[[ -n "$REQUIRED_BUNDLER" ]] || fail "Could not read required Bundler version from Gemfile.lock"

command -v ruby >/dev/null 2>&1 || fail "Ruby is not installed. Install Ruby $REQUIRED_RUBY first."

CURRENT_RUBY="$(ruby -e 'print RUBY_VERSION')"
if [[ "$CURRENT_RUBY" != "$REQUIRED_RUBY" ]]; then
  fail "Ruby $CURRENT_RUBY is active, but this repo requires Ruby $REQUIRED_RUBY. If you use rbenv: rbenv install -s $REQUIRED_RUBY && rbenv local $REQUIRED_RUBY"
fi

if ! gem list bundler -i -v "$REQUIRED_BUNDLER" >/dev/null 2>&1; then
  fail "Bundler $REQUIRED_BUNDLER is not installed for Ruby $REQUIRED_RUBY. Install it with: gem install bundler -v $REQUIRED_BUNDLER"
fi

if ! bundle _${REQUIRED_BUNDLER}_ --version >/dev/null 2>&1; then
  fail "Bundler $REQUIRED_BUNDLER is installed but not runnable from the current environment. Try: gem install bundler -v $REQUIRED_BUNDLER"
fi

echo "✓ Ruby $CURRENT_RUBY and Bundler $REQUIRED_BUNDLER match the repo toolchain."
