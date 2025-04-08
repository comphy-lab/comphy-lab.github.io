#!/usr/bin/env ruby
require 'json'
require 'nokogiri'
require 'fileutils'
require 'open-uri'
require 'net/http'
require 'uri'
require 'set'
require 'thread'  # This provides Queue

# Get the project root directory (one level up from scripts)
ROOT_DIR = File.expand_path('..', __dir__)

# Initialize search database
search_db = []

# Helper function to generate proper anchor links
def generate_anchor(text)
  # Remove date prefix if present (e.g., "2025-01-21 ")
  text = text.sub(/^\d{4}-\d{2}-\d{2}\s+/, '')
  
  # Remove markdown link syntax if present [[text]]
  text = text.gsub(/\[\[(.*?)\]\]/, '\1')
  
  # Remove any other markdown formatting
  text = text.gsub(/[*_`]/, '')
  
  # Keep special characters that are part of the title
  text = text.gsub(/[^\w\s\-':]/, '')
  
  # Replace spaces with +
  text = text.gsub(/\s+/, '+')
  
  # Ensure special characters are properly encoded
  URI.encode_www_form_component(text)
end

# Parse markdown frontmatter to extract metadata
def parse_frontmatter(content)
  front_matter = {}
  if content.start_with?("---\n")
    _, yaml_text, content = content.split("---\n", 3)
    yaml_text.lines.each do |line|
      if line.include?(":")
        key, value = line.split(":", 2).map(&:strip)
        front_matter[key] = value
      end
    end
  end
  [front_matter, content]
end

# Process team members first (highest priority)
Dir.glob(File.join(ROOT_DIR, '_team', '*.md')).each do |file|
  puts "Processing team member file #{file}..."
  
  content = File.read(file)
  front_matter, content = parse_frontmatter(content)
  
  # Split content by headers
  sections = content.split(/^#+\s+/)
  sections.shift # Remove content before first header
  
  sections.each do |section|
    next if section.strip.empty?
    
    # Extract header and content
    lines = section.lines
    header = lines.first.strip
    content = lines[1..].join.strip
    
    next if header.empty? || content.empty?
    next unless header.match?(/^[^#]+/) # Skip if header starts with #
    
    # Create high-priority entry for team member
    entry = {
      'title' => header,
      'content' => content,
      'url' => '/team/#' + header.downcase.gsub(/[^a-z0-9]+/, '-'),
      'type' => 'team_member',
      'priority' => 1  # Highest priority for team members
    }
    search_db << entry
  end
end

# Process research content from _research directory
Dir.glob(File.join(ROOT_DIR, '_research', '*.md')).each do |file|
  puts "Processing research file #{file}..."
  
  content = File.read(file)
  front_matter, content = parse_frontmatter(content)
  
  # Get the layout and permalink from front matter
  layout = front_matter['layout'] || 'research'
  permalink = front_matter['permalink'] || '/research/'
  
  # Process paper entries (h3 tags with ids)
  paper_sections = content.scan(/<h3 id="([^"]+)">\[([\d]+)\](.*?)<\/h3>(.*?)(?=<h3|\z)/m)
  
  paper_sections.each do |id, number, title, section_content|
    # Extract tags
    tags = []
    if section_content.match(/<tags>(.*?)<\/tags>/m)
      tag_content = $1
      tags = tag_content.scan(/<span>(.*?)<\/span>/).flatten
    end
    
    # Create entry for paper
    entry = {
      'title' => "[#{number}]#{title.strip}",
      'content' => section_content.gsub(/<[^>]+>/, ' ').gsub(/\s+/, ' ').strip,
      'url' => "#{permalink}##{id}",
      'type' => 'paper',
      'tags' => tags,
      'priority' => 3  # Medium priority for papers
    }
    search_db << entry
    
    # Check if this is a featured paper
    if tags.include?('Featured')
      # Boost priority for featured papers
      entry['priority'] = 2
    end
  end
end

# Process teaching content from _teaching directory
Dir.glob(File.join(ROOT_DIR, '_teaching', '*.md')).each do |file|
  puts "Processing teaching file #{file}..."
  
  content = File.read(file)
  front_matter, content = parse_frontmatter(content)
  
  # Determine the URL for this teaching content
  url = front_matter['permalink'] || '/teaching/'
  
  # Get the title from front matter or filename
  title = front_matter['title'] || File.basename(file, '.md').gsub(/^\d{4}-/, '').tr('-', ' ')
  
  # Process course details (div sections)
  if content.match(/<div class="course-details">(.*?)<\/div>/m)
    course_details = $1
    details_sections = course_details.scan(/<div class="course-details__item">\s*<h4>(.*?)<\/h4>\s*<p>(.*?)<\/p>\s*<\/div>/m)
    
    details_sections.each do |heading, detail_content|
      # Clean up heading (remove HTML tags)
      clean_heading = heading.gsub(/<[^>]+>/, '').strip
      
      # Create entry for course detail
      entry = {
        'title' => "#{title} - #{clean_heading}",
        'content' => detail_content.strip,
        'url' => url,
        'type' => 'teaching_detail',
        'priority' => 2  # Medium-high priority for teaching content
      }
      search_db << entry
    end
  end
  
  # Split content by headers
  sections = content.split(/^#+\s+/)
  sections.shift # Remove content before first header
  
  sections.each do |section|
    next if section.strip.empty?
    
    # Extract header and content
    lines = section.lines
    header = lines.first.strip
    section_content = lines[1..].join.strip
    
    next if header.empty? || section_content.empty?
    next if section_content.length < 50 # Skip very short sections
    
    # Skip navigation-like sections
    next if header.match?(/^(navigation|menu|contents|index)$/i)
    
    # Clean HTML tags for indexing
    clean_content = section_content.gsub(/<[^>]+>/, ' ').gsub(/\s+/, ' ').strip
    
    # Create entry for the section
    entry = {
      'title' => "#{title} - #{header}",
      'content' => clean_content,
      'url' => "#{url}##{generate_anchor(header)}",
      'type' => 'teaching_content',
      'priority' => 2  # Medium-high priority for teaching content
    }
    search_db << entry
    
    # Also create entries for individual paragraphs
    paragraphs = clean_content.split(/\n\n+/)
    paragraphs.each do |para|
      para = para.strip
      next if para.empty?
      next if para.length < 100 # Only include substantial paragraphs
      next if para.start_with?('```') # Skip code blocks
      next if para.start_with?('<') # Skip HTML
      
      entry = {
        'title' => "#{title} - #{header}",
        'content' => para,
        'url' => "#{url}##{generate_anchor(header)}",
        'type' => 'teaching_paragraph',
        'priority' => 2
      }
      search_db << entry
    end
  end
end

# Process markdown files from root directory
Dir.glob(File.join(ROOT_DIR, '*.md')).each do |file|
  next if file.start_with?(File.join(ROOT_DIR, '_team')) # Skip team members already processed
  next if file.start_with?(File.join(ROOT_DIR, '_teaching')) # Skip teaching already processed
  next if file.start_with?(File.join(ROOT_DIR, '_research')) # Skip research already processed
  next if File.basename(file).downcase == 'readme.md' # Skip README.md file
  
  puts "Processing markdown file #{file}..."
  
  content = File.read(file)
  front_matter, content = parse_frontmatter(content)
  
  # Get the layout and permalink from front matter
  layout = front_matter['layout'] || 'default'
  permalink = front_matter['permalink'] || "/#{File.basename(file, '.md').downcase}/"
  
  # Get the title from front matter or filename
  title = front_matter['title'] || File.basename(file, '.md').capitalize
  
  # Split content by headers
  sections = content.split(/^#+\s+/)
  sections.shift # Remove content before first header
  
  sections.each do |section|
    next if section.strip.empty?
    
    # Extract header and content
    lines = section.lines
    header = lines.first.strip
    section_content = lines[1..].join.strip
    
    next if header.empty? || section_content.empty?
    next if section_content.length < 50 # Skip very short sections
    
    # Skip navigation-like sections
    next if header.match?(/^(navigation|menu|contents|index)$/i)
    
    # Clean HTML tags for indexing
    clean_content = section_content.gsub(/<[^>]+>/, ' ').gsub(/\s+/, ' ').strip
    
    # Create entry for the section
    entry = {
      'title' => header,
      'content' => clean_content,
      'url' => "#{permalink}##{generate_anchor(header)}",
      'type' => 'markdown_section',
      'priority' => 3  # Medium priority for regular content
    }
    search_db << entry
    
    # Also create entries for individual paragraphs
    paragraphs = clean_content.split(/\n\n+/)
    paragraphs.each do |para|
      para = para.strip
      next if para.empty?
      next if para.length < 100 # Only include substantial paragraphs
      next if para.start_with?('```') # Skip code blocks
      next if para.start_with?('<') # Skip HTML
      
      entry = {
        'title' => header,
        'content' => para,
        'url' => "#{permalink}##{generate_anchor(header)}",
        'type' => 'markdown_text',
        'priority' => 3
      }
      search_db << entry
    end
  end
end

# Fetch and index external blog content
def fetch_blog_content
  puts "Reading blog content from Node.js output..."
  blog_content_file = File.join(File.dirname(__FILE__), 'blog_content.json')
  
  if File.exist?(blog_content_file)
    begin
      blog_entries = JSON.parse(File.read(blog_content_file))
      puts "Found #{blog_entries.length} blog entries"
      
      processed_entries = []
      
      blog_entries.each do |entry|
        # Skip empty entries
        next if entry['content'].nil? || entry['content'].strip.empty?
        
        # Clean up the content first
        content = entry['content']
                   .gsub(/^(created|status|modified|author|date published):.*$/, '')  # Remove metadata lines
                   .gsub(/\n+/, "\n")        # Normalize newlines
                   .strip
        
        # First, try to split by headers
        sections = content.split(/(?=^#+\s+)/).map(&:strip).reject(&:empty?)
        
        # If no headers found, treat the whole content as one section
        sections = [content] if sections.empty?
        
        sections.each do |section|
          # Get section title
          title = if section.match?(/^#+\s+/)
            # If section starts with header, use it as title
            header = section.lines.first.strip
            section = section.sub(/^#+\s+[^\n]+\n/, '').strip  # Remove header from content
            header.gsub(/^#+\s+/, '')
                 .sub(/\s*-\s*aliases:?\s*$/i, '')  # Remove "- aliases" suffix
          else
            # Otherwise use first sentence or phrase as title
            first_line = section.lines.first.strip
            first_line.split(/[.!?]/).first
                     .sub(/\s*-\s*aliases:?\s*$/i, '')  # Remove "- aliases" suffix
          end
          
          # Clean up the title
          title = title.gsub(/\s+/, ' ').strip  # Normalize spaces
          
          # Generate a more descriptive title by combining blog title and section title
          blog_title = entry['title'].sub(/\s+-\s+.*$/, '').strip
          section_title = if title.downcase.start_with?(blog_title.downcase)
            title  # Use section title if it already includes blog title
          else
            "#{blog_title} - #{title}"  # Combine blog title with section title
          end
          
          # Skip if no content left after title
          next if section.strip.empty?
          
          # Split content into paragraphs
          paragraphs = section.split(/\n\n+/).map(&:strip).reject(&:empty?)
          
          paragraphs.each do |para|
            # Skip code blocks and HTML
            next if para.start_with?('```') || para.start_with?('<')
            next if para.match?(/^[\s#*\-]+$/)  # Skip lines that are just formatting
            
            # Split long paragraphs into smaller chunks
            if para.length > 300
              # Split by sentences
              sentences = para.split(/(?<=[.!?])\s+(?=[A-Z])/)
              current_chunk = []
              current_length = 0
              
              sentences.each do |sentence|
                if current_length + sentence.length > 300
                  # Store current chunk if not empty
                  if current_chunk.any?
                    chunk_text = current_chunk.join(' ').strip
                    if chunk_text.length >= 50  # Only store substantial chunks
                      processed_entries << {
                        'title' => section_title,
                        'content' => chunk_text,
                        'url' => entry['url'],
                        'type' => 'blog_excerpt',
                        'priority' => 3
                      }
                    end
                    current_chunk = []
                    current_length = 0
                  end
                end
                current_chunk << sentence
                current_length += sentence.length
              end
              
              # Store any remaining content
              if current_chunk.any?
                chunk_text = current_chunk.join(' ').strip
                if chunk_text.length >= 50
                  processed_entries << {
                    'title' => section_title,
                    'content' => chunk_text,
                    'url' => entry['url'],
                    'type' => 'blog_excerpt',
                    'priority' => 3
                  }
                end
              end
            else
              # For shorter paragraphs, store as is if substantial
              if para.length >= 50
                processed_entries << {
                  'title' => section_title,
                  'content' => para,
                  'url' => entry['url'],
                  'type' => 'blog_excerpt',
                  'priority' => 3
                }
              end
            end
          end
        end
      end
      
      puts "Generated #{processed_entries.length} searchable entries from blog content"
      processed_entries
    rescue JSON::ParserError => e
      puts "Error parsing blog content: #{e.message}"
      []
    end
  else
    puts "No blog content file found. Run 'node scripts/fetch_blog_content.js' first."
    []
  end
end

begin
  puts "Generating search database..."
  
  # Add blog entries to search database
  search_db.concat(fetch_blog_content)
  
  # Write to JSON file in source assets/js directory first
  source_file = File.join(File.dirname(__FILE__), '..', 'assets', 'js', 'search_db.json')
  File.write(source_file, JSON.pretty_generate(search_db))
  puts "Written search database to #{source_file}"
  
  # Also write to _site directory if it exists (for local testing)
  site_file = File.join(File.dirname(__FILE__), '..', '_site', 'assets', 'js', 'search_db.json')
  if File.directory?(File.dirname(site_file))
    File.write(site_file, JSON.pretty_generate(search_db))
    puts "Written search database to #{site_file}"
  end
  
  puts "Generated search database with #{search_db.length} entries"
rescue => e
  puts "Error: #{e.message}"
  puts e.backtrace
  exit 1
end
