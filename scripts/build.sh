#!/bin/bash

# Exit on error
set -e

# Parse command line arguments
CLEAN_BUILD=false
SKIP_SEO=false
SKIP_RESEARCH=false

show_help() {
    cat << EOF
Usage: ./scripts/build.sh [OPTIONS]

Build the CoMPhy Lab Jekyll website with all assets and generated pages.

OPTIONS:
    -h, --help          Show this help message and exit
    -c, --clean         Force clean rebuild (removes _site directory first)
    --skip-seo          Skip SEO metadata generation
    --skip-research     Skip pre-filtered research page generation
    --skip-deps         Skip dependency installation (Ruby gems and npm packages)

EXAMPLES:
    ./scripts/build.sh              # Standard build
    ./scripts/build.sh --clean      # Clean rebuild
    ./scripts/build.sh --skip-seo   # Build without SEO generation

EOF
    exit 0
}

# Parse arguments
SKIP_DEPS=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            ;;
        -c|--clean)
            CLEAN_BUILD=true
            shift
            ;;
        --skip-seo)
            SKIP_SEO=true
            shift
            ;;
        --skip-research)
            SKIP_RESEARCH=true
            shift
            ;;
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        *)
            echo "Error: Unknown option $1"
            echo "Run './scripts/build.sh --help' for usage information"
            exit 1
            ;;
    esac
done

echo "Starting build process..."

# Clean build if requested
if [ "$CLEAN_BUILD" = true ]; then
    echo "Performing clean rebuild..."
    if [ -d "_site" ]; then
        echo "Removing _site directory..."
        rm -rf _site
    fi
    if [ -d ".jekyll-cache" ]; then
        echo "Removing .jekyll-cache directory..."
        rm -rf .jekyll-cache
    fi
fi

# Check if running in GitHub Actions
if [ -n "$GITHUB_ACTIONS" ]; then
    echo "Running in GitHub Actions environment"
    # GitHub Actions already has Ruby and Bundler set up via ruby/setup-ruby@v1

    if [ "$SKIP_DEPS" = false ]; then
        # Install npm dependencies in GitHub Actions
        echo "Installing npm dependencies in GitHub Actions environment..."
        if [ -d "./scripts" ] && [ -f "./scripts/package.json" ]; then
            (cd ./scripts && npm install --no-fund --no-audit --ignore-scripts)
        fi

        if [ -f "./package.json" ]; then
            npm install --no-fund --no-audit --ignore-scripts
        fi
    else
        echo "Skipping dependency installation (--skip-deps flag)"
    fi
else
    # Try to detect the environment for local builds
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macOS detected"
        
        # Check if Ruby is installed
        if ! command -v ruby &> /dev/null; then
            echo "Ruby is not installed. Attempting to install Ruby using Homebrew..."
            
            # Check if Homebrew is installed
            if ! command -v brew &> /dev/null; then
                echo "Homebrew not found. Please install Homebrew first by running:"
                echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
                exit 1
            fi
            
            # Install Ruby using Homebrew
            brew install ruby
            
            # Add Ruby to PATH (this will only affect the current session)
            export PATH="$(brew --prefix)/opt/ruby/bin:$PATH"
            export PATH="$(gem env gemdir)/bin:$PATH"
            
            echo "Ruby has been installed. You may need to add the following to your shell profile:"
            echo 'export PATH="$(brew --prefix)/opt/ruby/bin:$PATH"'
            echo 'export PATH="$(gem env gemdir)/bin:$PATH"'
        else
            # Check Ruby version
            RUBY_VERSION=$(ruby -v | cut -d ' ' -f 2 | cut -d 'p' -f 1)
            echo "Found Ruby version $RUBY_VERSION"
        fi
    elif [ -f /etc/os-release ]; then
        . /etc/os-release
        OS_NAME=$NAME
        echo "Detected OS: $OS_NAME"
        
        # Set up Ruby environment for Linux distros
        if [[ "$OS_NAME" == *"Ubuntu"* ]] || [[ "$OS_NAME" == *"Debian"* ]]; then
            echo "Setting up Ruby environment for Debian/Ubuntu..."
            
            # Check if Ruby is installed
            if ! command -v ruby &> /dev/null; then
                echo "Ruby is not installed. Attempting to install Ruby..."
                DEBIAN_FRONTEND=noninteractive sudo apt-get update -y
                DEBIAN_FRONTEND=noninteractive sudo apt-get install -y --no-install-recommends \
                  ruby-full build-essential zlib1g-dev
            fi
            
            # Set GEM environment variables
            export GEM_HOME="$HOME/gems"
            export PATH="$HOME/gems/bin:$PATH"
        else
            echo "Standard setup for $OS_NAME"
        fi
    else
        echo "Unknown OS, proceeding with default configuration"
    fi

    # Check if Ruby is installed
    if ! command -v ruby &> /dev/null; then
        echo "ERROR: Ruby is not installed or not in PATH. Please install Ruby first."
        exit 1
    fi

    echo "Ruby version: $(ruby -v)"
    if ! command -v bundle &> /dev/null; then
        echo "Bundler not found. Installing Bundler..."
        gem install bundler --user-install --no-document
        # Ensure the user‐install bin directory is in PATH
        export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
    fi

    echo "Bundler version: $(bundle -v)"

    if [ "$SKIP_DEPS" = false ]; then
        # Install dependencies for local environment
        echo "Installing Ruby dependencies..."
        bundle install

        # Install npm dependencies (for husky, lint-staged, etc.)
        echo "Installing npm dependencies..."
        if [ -d "./scripts" ] && [ -f "./scripts/package.json" ]; then
            # Script directory has its own package.json
            (cd ./scripts && npm install --no-fund --no-audit --ignore-scripts)
        fi

        # Also install root npm dependencies if package.json exists
        if [ -f "./package.json" ]; then
            npm install --no-fund --no-audit --ignore-scripts
        fi
    else
        echo "Skipping dependency installation (--skip-deps flag)"
    fi
fi

# Build the Jekyll site
echo "Building Jekyll site..."
JEKYLL_ENV=production bundle exec jekyll build

# Generate pre-filtered research pages
if [ "$SKIP_RESEARCH" = false ]; then
    echo "Generating pre-filtered research pages..."
    bundle exec ruby scripts/generate_filtered_research.rb
else
    echo "Skipping research page generation (--skip-research flag)"
fi

# Check if search database exists
if [ "$SKIP_SEO" = false ]; then
    if [ -f "assets/js/search_db.json" ]; then
        # Generate SEO metadata from search database
        echo "Generating SEO metadata from search database..."
        chmod +x scripts/generate_seo_tags.rb
        bundle exec ruby scripts/generate_seo_tags.rb
    else
        echo "Warning: search_db.json not found - skipping SEO metadata generation"
    fi
else
    echo "Skipping SEO metadata generation (--skip-seo flag)"
fi

echo "Build completed successfully!"
