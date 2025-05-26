#!/bin/bash

# Setup script for installing Ruby, Node.js, and project dependencies on a clean machine

set -e  # Exit on error

echo "=== Dependency Setup Script ==="

# Check if Ruby is installed
if command -v ruby &> /dev/null; then
    echo "Ruby is already installed: $(ruby --version)"
else
    echo "Ruby not found. Installing Ruby via rbenv..."
    
    # Install rbenv
    if [ ! -d "$HOME/.rbenv" ]; then
        git clone https://github.com/rbenv/rbenv.git ~/.rbenv
        echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
        echo 'eval "$(rbenv init -)"' >> ~/.bashrc
        
        # Also add to ~/.bash_profile for macOS compatibility
        echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bash_profile
        echo 'eval "$(rbenv init -)"' >> ~/.bash_profile
        
        # Source the appropriate file based on shell
        if [ -f ~/.bashrc ]; then
            source ~/.bashrc
        elif [ -f ~/.bash_profile ]; then
            source ~/.bash_profile
        fi
        
        # Install ruby-build plugin
        git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
    fi
    
    # Set PATH for current session
    export PATH="$HOME/.rbenv/bin:$PATH"
    eval "$(rbenv init -)"
    
    # Install Ruby 3.2
    echo "Installing Ruby 3.2.0..."
    rbenv install 3.2.0
    rbenv global 3.2.0
    
    echo "Ruby installed successfully: $(ruby --version)"
fi

# Check if Bundler is installed
if command -v bundle &> /dev/null; then
    echo "Bundler is already installed: $(bundle --version)"
else
    echo "Installing Bundler..."
    gem install bundler
    echo "Bundler installed successfully"
fi

# Check if Node.js is installed
if command -v node &> /dev/null; then
    echo "Node.js is already installed: $(node --version)"
else
    echo "Node.js not found. Installing Node.js via nvm..."
    
    # Install nvm
    if [ ! -d "$HOME/.nvm" ]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        
        # Source nvm
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    fi
    
    # Install latest Node.js
    echo "Installing latest Node.js..."
    nvm install node
    nvm use node
    
    echo "Node.js installed successfully: $(node --version)"
fi

# Install project dependencies
echo "Installing project dependencies..."

if [ -f "Gemfile" ]; then
    echo "Installing Ruby gems..."
    bundle install
else
    echo "Warning: Gemfile not found in current directory"
fi

if [ -f "package.json" ]; then
    echo "Installing npm packages..."
    npm install
else
    echo "Warning: package.json not found in current directory"
fi

echo "=== Setup complete! ==="
echo ""
echo "To update dependencies in the future, run:"
echo "  bundle update    # For Ruby gems"
echo "  npm update       # For npm packages"