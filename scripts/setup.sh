#!/bin/bash

# CoMPhy Lab Website Setup Script
# Setup for existing development environments
# Install Ruby and Node.js with a trusted package manager before running this
# If rbenv is already installed, it can still install the repo-pinned Ruby
# Usage: ./scripts/setup.sh

set -e  # Exit on error

echo "🚀 Setting up CoMPhy Lab website environment..."
echo ""

# Check if running from project root
if [ ! -f "Gemfile" ]; then
  echo "❌ Error: Please run this script from the project root directory"
  echo "   Usage: ./scripts/setup.sh"
  exit 1
fi

REQUIRED_RUBY_VERSION="$(tr -d '[:space:]' < .ruby-version)"
REQUIRED_BUNDLER_VERSION="$(awk '/^BUNDLED WITH$/{getline; gsub(/^[[:space:]]+/, "", $0); print; exit}' Gemfile.lock)"

# Check Ruby installation
echo "📦 Checking Ruby installation..."

# Check if rbenv is being used and handle version issues
if command -v rbenv &> /dev/null && [ -f ".ruby-version" ]; then
  echo "📌 Project requires Ruby ${REQUIRED_RUBY_VERSION} (via .ruby-version)"
  RBENV_ROOT="$(rbenv root)"
  export PATH="${RBENV_ROOT}/bin:${RBENV_ROOT}/shims:${PATH}"

  # Check if the required version is installed
  if ! rbenv versions --bare | grep -q "^${REQUIRED_RUBY_VERSION}$"; then
    echo "⚠️  Ruby ${REQUIRED_RUBY_VERSION} is not installed via rbenv"
    echo "Installing Ruby ${REQUIRED_RUBY_VERSION} via rbenv..."
    rbenv install -s "${REQUIRED_RUBY_VERSION}"
  fi

  export RBENV_VERSION="${REQUIRED_RUBY_VERSION}"
  rbenv rehash
fi

# First check if Ruby is installed at all
if ! command -v ruby &> /dev/null; then
  echo "❌ Ruby not found on PATH."
  echo "   Install Ruby ${REQUIRED_RUBY_VERSION} with a trusted"
  echo "   package manager or rbenv before running this script again."
  exit 1
fi

# Now check Ruby again
if command -v ruby &> /dev/null; then
  RUBY_VERSION=$(ruby --version 2>&1 || echo "Ruby version check failed")
  if [[ "$RUBY_VERSION" == *"rbenv: version"* ]] && [ -f ".ruby-version.bak" ]; then
    # If rbenv still complains, we definitely need to bypass it
    rm -f .ruby-version
    RUBY_VERSION=$(ruby --version)
    mv .ruby-version.bak .ruby-version
  fi
  echo "✅ Ruby installed: $RUBY_VERSION"
else
  echo "❌ Ruby is not installed. Please install Ruby first."
  echo "   Visit: https://www.ruby-lang.org/en/documentation/installation/"
  exit 1
fi

# Check Bundler installation
echo "📦 Checking Bundler..."
if gem list bundler -i -v "$REQUIRED_BUNDLER_VERSION" >/dev/null 2>&1; then
  echo "✅ Bundler ${REQUIRED_BUNDLER_VERSION} is installed"
else
  echo "⚠️  Bundler ${REQUIRED_BUNDLER_VERSION} not found. Installing..."
  gem install bundler -v "$REQUIRED_BUNDLER_VERSION"
  echo "✅ Bundler ${REQUIRED_BUNDLER_VERSION} installed"
fi

if ! bundle _${REQUIRED_BUNDLER_VERSION}_ --version >/dev/null 2>&1; then
  echo "❌ Bundler ${REQUIRED_BUNDLER_VERSION} is installed but not runnable"
  exit 1
fi

echo "🧪 Checking Ruby/Bundler toolchain..."
bash scripts/check-ruby-toolchain.sh

# Check Node.js installation
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  echo "✅ Node.js installed: $NODE_VERSION"
else
  echo "❌ Node.js not found."
  echo "   Install a current LTS Node.js release with a trusted"
  echo "   package manager before running this script again."
  exit 1
fi

# Check npm installation
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  echo "✅ npm installed: $NPM_VERSION"
else
  echo "❌ npm is not installed. Please install npm."
  exit 1
fi

# Install Ruby dependencies
echo ""
echo "💎 Installing Ruby dependencies..."
bundle _${REQUIRED_BUNDLER_VERSION}_ install

# Install Node.js dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
# Skip prepare script (husky) during setup to avoid interactive prompts
npm install --no-fund --no-audit --ignore-scripts

# Manually create binary links for executables since we skipped scripts
echo "🔗 Setting up binary links..."
if [ -d "node_modules" ]; then
  mkdir -p node_modules/.bin
  # Link Jest
  if [ -f "node_modules/jest/bin/jest.js" ]; then
    ln -sf ../jest/bin/jest.js node_modules/.bin/jest 2>/dev/null || true
  fi
  # Link other common binaries that might be needed
  for bin in eslint prettier markdownlint stylelint; do
    if [ -f "node_modules/$bin/bin/$bin.js" ]; then
      ln -sf ../$bin/bin/$bin.js node_modules/.bin/$bin 2>/dev/null || true
    fi
  done
fi

# Check Jekyll installation
echo ""
echo "🏗️  Checking Jekyll..."
if bundle exec jekyll --version &> /dev/null; then
  JEKYLL_VERSION=$(bundle exec jekyll --version)
  echo "✅ Jekyll installed: $JEKYLL_VERSION"
else
  echo "❌ Jekyll installation failed"
  exit 1
fi

# Build the site and generate search database
echo ""
echo "🔨 Building site and generating search database..."
./scripts/build.sh

# Install husky hooks
echo ""
echo "🪝 Installing Git hooks (husky)..."
npx husky install

# Run simple validation tests
echo ""
echo "🧪 Running validation tests..."
node scripts/simple-test.js

# Restore .ruby-version if it was temporarily moved
if [ -f ".ruby-version.bak" ]; then
  echo ""
  echo "🔄 Restoring .ruby-version file..."
  mv .ruby-version.bak .ruby-version
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Run the development server: bundle exec jekyll serve"
echo "   2. Open in browser: http://localhost:4000"
echo ""
echo "📚 Useful commands:"
echo "   - Build site: ./scripts/build.sh"
echo "   - Check code: ./scripts/lint-check.sh"
echo "   - Fix code issues: ./scripts/lint-check.sh --fix"
echo "   - Run tests: npm test"
echo "   - Update dependencies: bundle update && npm update"
echo ""
echo "✅ Pre-commit hooks are now installed and will run automatically on git commit"
echo ""
