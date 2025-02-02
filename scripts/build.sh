#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
bundle install

# Build the Jekyll site
echo "Building Jekyll site..."
JEKYLL_ENV=production bundle exec jekyll build

# Generate search database
echo "Generating search database..."
cd scripts
bundle exec ruby generate_search_db.rb
cd ..

echo "Build completed successfully!"
