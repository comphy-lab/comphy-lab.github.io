#!/usr/bin/env ruby
require 'json'
require 'nokogiri'
require 'fileutils'

# Get the project root directory (one level up from scripts)
ROOT_DIR = File.expand_path('..', __dir__)

# Initialize search database
search_db = []

# Process each HTML file
Dir.glob(File.join(ROOT_DIR, '_site', '**', '*.html')) do |file|
  next if file.include?('/assets/') # Skip asset files
  
  puts "Processing #{file}..."
  
  # Read and parse HTML
  html = File.read(file)
  doc = Nokogiri::HTML(html)
  
  # Get relative URL
  url = file.sub(File.join(ROOT_DIR, '_site'), '')
  
  # Extract page title
  title = doc.at_css('title')&.text || File.basename(file, '.html').capitalize

  # Special handling for team members
  doc.css('h2').each do |heading|
    name = heading.text.strip
    next if name.empty?

    # Get content following the heading until the next h2
    content_nodes = []
    current = heading.next_element
    while current && current.name != 'h2'
      if current.text?
        content_nodes << current.text.strip
      elsif current.name == 'ul' || current.name == 'p'
        content_nodes << current.text.strip
      end
      current = current.next_element
    end
    content = content_nodes.join(' ').strip

    # Create entry for team member
    if content.include?('Research Interest') || content.include?('Collaboration on') || content.match?(/Ph\.D\.|Postdoc|Professor|Student/)
      entry = {
        'title' => name,
        'content' => content,
        'url' => "#{url}##{name.downcase.gsub(/[^a-z0-9]+/, '-')}",
        'type' => 'team_member'
      }
      search_db << entry
    end
  end

  # Process other content sections
  doc.css('h1, h2, h3, h4, h5, h6').each do |heading|
    # Skip if this is a team member heading we already processed
    next if heading.name == 'h2' && heading.text.strip.match?(/Ph\.D\.|Postdoc|Professor|Student/)
    
    # Get the heading text
    heading_text = heading.text.strip
    next if heading_text.empty?

    # Find the next tags element after this heading
    tags_element = heading.xpath('following-sibling::tags[1]')
    
    # Get tags if they exist
    tags = []
    if tags_element.any?
      tags = tags_element.css('span').map(&:text).map(&:strip)
    end

    # Get content between this heading and the next heading or tags
    content_nodes = []
    current = heading.next_element
    while current && !['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].include?(current.name)
      content_nodes << current.text.strip if current.text?
      current = current.next_element
    end
    content = content_nodes.join(' ').strip

    # Create search entry
    entry = {
      'title' => heading_text,
      'content' => content,
      'url' => url,
      'type' => heading.name # h1, h2, etc.
    }

    # Only add tags if they exist
    entry['tags'] = tags unless tags.empty?

    # Add heading ID for direct linking if available
    if heading['id']
      entry['url'] += "##{heading['id']}"
    else
      entry['url'] += "##{heading_text.downcase.gsub(/[^a-z0-9]+/, '-')}"
    end

    search_db << entry
  end

  # Also index any standalone paragraphs (not in sections)
  doc.css('body > p').each do |para|
    content = para.text.strip
    next if content.empty?

    # Look for tags before or after this paragraph
    tags = []
    tags_before = para.xpath('preceding-sibling::tags[1]')
    tags_after = para.xpath('following-sibling::tags[1]')
    
    if tags_before.any? && !tags_before.xpath('following-sibling::h1|following-sibling::h2|following-sibling::h3|following-sibling::h4|following-sibling::h5|following-sibling::h6').any?
      tags = tags_before.css('span').map(&:text).map(&:strip)
    elsif tags_after.any? && !tags_after.xpath('preceding-sibling::h1|preceding-sibling::h2|preceding-sibling::h3|preceding-sibling::h4|preceding-sibling::h5|preceding-sibling::h6').any?
      tags = tags_after.css('span').map(&:text).map(&:strip)
    end

    entry = {
      'title' => title,
      'content' => content,
      'url' => url,
      'type' => 'paragraph'
    }

    # Only add tags if they exist
    entry['tags'] = tags unless tags.empty?

    search_db << entry
  end
end

# Write to JSON file in source assets/js directory first
source_dir = File.join(ROOT_DIR, 'assets', 'js')
FileUtils.mkdir_p(source_dir)
source_file = File.join(source_dir, 'search_db.json')
File.write(source_file, JSON.pretty_generate(search_db))

# Also write to _site directory for immediate use
site_dir = File.join(ROOT_DIR, '_site', 'assets', 'js')
FileUtils.mkdir_p(site_dir)
site_file = File.join(site_dir, 'search_db.json')
FileUtils.cp(source_file, site_file)

puts "Generated search database with #{search_db.length} entries"
