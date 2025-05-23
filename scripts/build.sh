#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Check if running in GitHub Actions
if [ -n "$GITHUB_ACTIONS" ]; then
    echo "Running in GitHub Actions environment"
    # GitHub Actions already has Ruby and Bundler set up via ruby/setup-ruby@v1
    
    # Install npm dependencies in GitHub Actions
    echo "Installing npm dependencies in GitHub Actions environment..."
    if [ -d "./scripts" ] && [ -f "./scripts/package.json" ]; then
        (cd ./scripts && npm install --no-fund --no-audit --ignore-scripts)
    fi
    
    if [ -f "./package.json" ]; then
        npm install --no-fund --no-audit --ignore-scripts
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
fi

# Build the Jekyll site
echo "Building Jekyll site..."
JEKYLL_ENV=production bundle exec jekyll build

# Generate pre-filtered research pages
echo "Generating pre-filtered research pages..."
bundle exec ruby scripts/generate_filtered_research.rb

# Check if search database exists
if [ -f "assets/js/search_db.json" ]; then
    # Generate SEO metadata from search database
    echo "Generating SEO metadata from search database..."
    chmod +x scripts/generate_seo_tags.rb
    bundle exec ruby scripts/generate_seo_tags.rb
else
    echo "Warning: search_db.json not found - skipping SEO metadata generation"
fi

echo "Build completed successfully!"
