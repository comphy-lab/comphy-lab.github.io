#!/usr/bin/env ruby
require 'json'
require 'fileutils'
require 'nokogiri'
require 'set'
require 'yaml'

# Get the project root directory (one level up from scripts)
ROOT_DIR = File.expand_path('..', __dir__)

# Load search database
search_db_path = File.join(ROOT_DIR, 'assets', 'js', 'search_db.json')
unless File.exist?(search_db_path)
  puts "Search database not found at #{search_db_path}"
  puts "Run scripts/generate_search_db.rb first"
  exit 1
end

search_db = JSON.parse(File.read(search_db_path))
puts "Loaded search database with #{search_db.length} entries"

# Initialize collections to store keywords and descriptions
keywords_by_url = {}
descriptions_by_url = {}
content_by_url = {}

# Track URL normalizations
normalized_urls = {}

# Helper method to normalize URLs
def normalize_url(url)
  # Remove anchor
  url = url.split('#').first

  # Ensure URL starts with a slash
  url = "/#{url}" unless url.start_with?('/')

  # Add index.html to root URL
  url = "/index.html" if url == "/"

  # Add .html extension to URLs without extension
  unless url.include?('.')
    url = "#{url.chomp('/')}/index.html"
  end

  # Remove leading slash for file operations
  url.sub(/^\//, '')
end

# Process search database to generate metadata
search_db.each do |entry|
  url = entry['url'].to_s

  # Skip external URLs
  next if url.start_with?('http')
  next if url.empty?

  # Normalize URL for internal files
  normalized_url = normalize_url(url)
  normalized_urls[url] = normalized_url

  # Initialize collections for this URL if not already present
  keywords_by_url[normalized_url] ||= Set.new
  descriptions_by_url[normalized_url] ||= Set.new
  content_by_url[normalized_url] ||= []

  # Extract keywords from title and content
  title = entry['title'].to_s
  content = entry['content'].to_s

  # Skip entries with little content
  next if content.length < 50

  # Generate keywords
  # From title - split and keep words longer than 3 characters
  title_keywords = title.downcase
                       .gsub(/[^\w\s]/, ' ')
                       .split(/\s+/)
                       .select { |w| w.length > 3 }
                       .map(&:strip)
                       .uniq
                       .take(5)
  
  # From type and tags
  type_keywords = [entry['type'].to_s.gsub('_', ' ')].reject(&:empty?)
  tag_keywords = (entry['tags'] || []).map(&:downcase)
  
  # Combine all keywords
  all_keywords = (title_keywords + type_keywords + tag_keywords).uniq.take(8)
  
  # Add to keywords for this URL
  keywords_by_url[normalized_url].merge(all_keywords)
  
  # Generate description
  description = content.gsub(/\s+/, ' ').strip.split(/[.!?]/).first
  
  # Only use if description is between 50 and 160 characters
  if description && description.length >= 50 && description.length <= 160
    descriptions_by_url[normalized_url].add(description)
  end
  
  # Store content for generating better descriptions if needed
  content_by_url[normalized_url] << content
end

puts "Generated metadata for #{keywords_by_url.keys.length} unique URLs"

# Generate better descriptions for URLs with no good descriptions
descriptions_by_url.each do |url, descriptions|
  if descriptions.empty? && content_by_url[url]
    # Join all content and create a description
    all_content = content_by_url[url].join(' ').gsub(/\s+/, ' ').strip
    
    # Take first 140 characters + ellipsis
    if all_content.length > 50
      description = all_content[0..140] + (all_content.length > 140 ? '...' : '')
      descriptions.add(description)
    end
  end
end

# Function to update HTML files with metadata
def update_html_with_metadata(file_path, keywords, description)
  return unless File.exist?(file_path)
  
  begin
    # Read file content
    html_content = File.read(file_path)
    
    # Parse with Nokogiri
    doc = Nokogiri::HTML(html_content)
    
    # Get existing head element
    head = doc.at_css('head')
    return unless head
    
    # Check for existing metadata
    existing_keywords = doc.css('meta[name="keywords"]')
    existing_description = doc.css('meta[name="description"]')
    
    # Update or add keywords meta tag
    if !keywords.empty?
      keywords_str = keywords.to_a.uniq.join(', ')
      if existing_keywords.empty?
        # Add new meta tag for keywords
        head.add_child("<meta name=\"keywords\" content=\"#{keywords_str}\">")
      else
        # Update existing keywords
        existing_keywords.first['content'] = keywords_str
      end
    end
    
    # Update or add description meta tag if we have a good one
    if !description.empty?
      desc_str = description.to_a.first
      
      # Add if no description meta or if the existing one is too short
      if existing_description.empty? || existing_description.first['content'].to_s.length < 50
        if existing_description.empty?
          # Add new meta tag for description
          head.add_child("<meta name=\"description\" content=\"#{desc_str}\">")
        else
          # Update existing description
          existing_description.first['content'] = desc_str
        end
      end
    end
    
    # Write updated content back to file
    File.write(file_path, doc.to_html)
    return true
  rescue => e
    puts "Error updating metadata for #{file_path}: #{e.message}"
    return false
  end
end

# Process HTML files and update metadata
site_dir = File.join(ROOT_DIR, '_site')
files_updated = 0

# Process each URL
keywords_by_url.each do |url, keywords|
  # Get description for this URL
  descriptions = descriptions_by_url[url] || Set.new
  
  # Get file path
  file_path = File.join(site_dir, url)
  
  # Update HTML file if it exists
  if update_html_with_metadata(file_path, keywords, descriptions)
    files_updated += 1
    puts "Updated metadata for #{url}"
  end
end

puts "Updated #{files_updated} HTML files with SEO metadata"

# Generate sitemapindex.xml
def generate_sitemapindex(site_dir)
  sitemap_path = File.join(site_dir, 'sitemap.xml')
  sitemapindex_path = File.join(site_dir, 'sitemapindex.xml')
  
  if File.exist?(sitemap_path)
    # Get last modification time
    last_mod = File.mtime(sitemap_path).strftime('%Y-%m-%dT%H:%M:%S%:z')
    
    # Create sitemapindex content
    sitemapindex_content = <<-XML
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://comphy-lab.org/sitemap.xml</loc>
    <lastmod>#{last_mod}</lastmod>
  </sitemap>
</sitemapindex>
    XML
    
    # Write to file
    File.write(sitemapindex_path, sitemapindex_content)
    puts "Generated sitemapindex.xml"
    return true
  else
    puts "sitemap.xml not found, skipping sitemapindex generation"
    return false
  end
end

# Generate sitemapindex
generate_sitemapindex(site_dir)

puts "SEO enhancement completed successfully!"
