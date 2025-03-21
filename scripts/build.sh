#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
bundle install

# Install Node.js dependencies for blog content fetching
echo "Installing Node.js dependencies..."
cd scripts
npm install
cd ..

# Fetch blog content from GitHub repository
echo "Fetching blog content from GitHub repository..."
cd scripts
npm run fetch-github
cd ..

# Build the Jekyll site
echo "Building Jekyll site..."
JEKYLL_ENV=production bundle exec jekyll build

# Generate search database
echo "Generating search database..."
cd scripts
bundle exec ruby generate_search_db.rb
cd ..

# Generate pre-filtered research pages
echo "Generating pre-filtered research pages..."
bundle exec ruby scripts/generate_filtered_research.rb

# Generate SEO metadata from search database
echo "Generating SEO metadata..."
chmod +x scripts/generate_seo_tags.rb
bundle exec ruby scripts/generate_seo_tags.rb

echo "Build completed successfully!"
