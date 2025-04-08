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

# Generate pre-filtered research pages
echo "Generating pre-filtered research pages..."
bundle exec ruby scripts/generate_filtered_research.rb

# Generate SEO metadata from search database
echo "Generating SEO metadata..."
chmod +x scripts/generate_seo_tags.rb
bundle exec ruby scripts/generate_seo_tags.rb

echo "Build completed successfully!"
