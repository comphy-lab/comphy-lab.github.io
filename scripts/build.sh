#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Check if running in GitHub Actions
if [ -n "$GITHUB_ACTIONS" ]; then
    echo "Running in GitHub Actions environment"
    # GitHub Actions already has Ruby and Bundler set up via ruby/setup-ruby@v1
else
    # Try to detect the environment for local builds
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macOS detected, proceeding with standard Ruby setup"
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
                sudo apt-get update -y
                sudo apt-get install -y ruby-full build-essential zlib1g-dev
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

    # Check if Bundler is installed, install if needed
    if ! command -v bundle &> /dev/null; then
        echo "Bundler not found. Installing Bundler..."
        gem install bundler
    fi

    echo "Bundler version: $(bundle -v)"

    # Install dependencies for local environment
    echo "Installing dependencies..."
    bundle install
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
    # Create a placeholder if SEO metadata is critical
    # echo "{}" > assets/js/search_db.json
fi

echo "Build completed successfully!"
