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

# Process team members first (highest priority)
Dir.glob(File.join(ROOT_DIR, '_team', '*.md')).each do |file|
  puts "Processing team member file #{file}..."
  
  content = File.read(file)
  
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

# Process markdown files first
Dir.glob(File.join(ROOT_DIR, '*.md')).each do |file|
  next if file.start_with?(File.join(ROOT_DIR, '_team')) # Skip team members
  next if File.basename(file).downcase == 'readme.md' # Skip README.md file (improved check)
  
  puts "Processing markdown file #{file}..."
  
  content = File.read(file)
  is_readme = file.end_with?('README.md')
  
  # Skip processing completely if it's README.md
  next if is_readme
  
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
    next if content.length < 50 # Skip very short sections
    
    # Skip navigation-like sections
    next if header.match?(/^(navigation|menu|contents|index)$/i)
    
    # Create entry for the section
    entry = {
      'title' => header,
      'content' => content,
      'url' => is_readme ? '/README.md' : '/#about',
      'type' => is_readme ? 'readme_section' : 'markdown_section',
      'priority' => is_readme ? 4 : 3  # Lower priority for README sections
    }
    search_db << entry
    
    # Only create paragraph entries for non-README content
    unless is_readme
      # Also create entries for individual paragraphs
      paragraphs = content.split(/\n\n+/)
      paragraphs.each do |para|
        para = para.strip
        next if para.empty?
        next if para.length < 100 # Only include substantial paragraphs
        next if para.start_with?('```') # Skip code blocks
        next if para.start_with?('<') # Skip HTML
        
        entry = {
          'title' => header,
          'content' => para,
          'url' => '/#about',
          'type' => 'markdown_text',
          'priority' => 3
        }
        search_db << entry
      end
    end
  end
end

# Process teaching content from _teaching directory
Dir.glob(File.join(ROOT_DIR, '_teaching', '*.md')).each do |file|
  puts "Processing teaching file #{file}..."
  
  content = File.read(file)
  
  # Extract YAML front matter to get permalink
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
  
  # Determine the URL for this teaching content
  url = front_matter['permalink'] || '/teaching/'
  
  # Get the title from front matter or filename
  title = front_matter['title'] || File.basename(file, '.md').gsub(/^\d{4}-/, '').tr('-', ' ')
  
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
    next if content.length < 50 # Skip very short sections
    
    # Skip navigation-like sections
    next if header.match?(/^(navigation|menu|contents|index)$/i)
    
    # Create entry for the section
    entry = {
      'title' => "#{title} - #{header}",
      'content' => content,
      'url' => "#{url}##{generate_anchor(header)}",
      'type' => 'teaching_content',
      'priority' => 2  # Medium-high priority for teaching content
    }
    search_db << entry
    
    # Also create entries for individual paragraphs
    paragraphs = content.split(/\n\n+/)
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

# Process each HTML file
Dir.glob(File.join(ROOT_DIR, '_site', '**', '*.html')) do |file|
  next if file.include?('/assets/') # Skip asset files
  
  puts "Processing HTML file #{file}..."
  
  # Read and parse HTML
  html = File.read(file)
  doc = Nokogiri::HTML(html)
  
  # Get relative URL
  url = file.sub(File.join(ROOT_DIR, '_site'), '')
  
  # Extract page title
  title = doc.at_css('title')&.text || File.basename(file, '.html').capitalize

  # Special handling for teaching pages
  if url.include?('/teaching/')
    # Process course details
    doc.css('.course-details__item').each do |detail|
      heading = detail.at_css('h4')&.text.to_s.strip
      content = detail.at_css('p')&.text.to_s.strip
      
      next if heading.empty? || content.empty?
      
      # Create entry for course detail
      entry = {
        'title' => "#{title} - #{heading}",
        'content' => content,
        'url' => url,
        'type' => 'teaching_detail',
        'priority' => 2  # Medium-high priority
      }
      search_db << entry
    end
    
    # Process course schedule/sections
    doc.css('h3').each do |heading|
      heading_text = heading.text.strip
      next if heading_text.empty?
      
      # Get content until next h3
      content_nodes = []
      current = heading.next_element
      while current && current.name != 'h3'
        content_nodes << current.text.strip unless current.text.strip.empty?
        current = current.next_element
      end
      content = content_nodes.join(' ').strip
      next if content.empty?
      
      # Create entry for course section
      entry = {
        'title' => "#{title} - #{heading_text}",
        'content' => content,
        'url' => "#{url}##{generate_anchor(heading_text)}",
        'type' => 'teaching_section',
        'priority' => 2
      }
      search_db << entry
    end
    
    # Process specific teaching sections like Prerequisites, Course Description, etc.
    ['Prerequisites', 'Course Description', 'Registration', 'What will you learn'].each do |section_name|
      section = doc.xpath("//h2[contains(text(), '#{section_name}')]").first
      next unless section
      
      # Get content until next h2
      content_nodes = []
      current = section.next_element
      while current && current.name != 'h2'
        content_nodes << current.text.strip unless current.text.strip.empty?
        current = current.next_element
      end
      content = content_nodes.join(' ').strip
      next if content.empty?
      
      # Create entry for the specific section
      entry = {
        'title' => "#{title} - #{section_name}",
        'content' => content,
        'url' => "#{url}##{generate_anchor(section_name)}",
        'type' => 'teaching_course_info',
        'priority' => 2
      }
      search_db << entry
    end
    
    # Process course card content on index page
    doc.css('.course-card').each do |card|
      card_title = card.at_css('.course-card__title')&.text.to_s.strip
      card_desc = card.at_css('.course-card__desc')&.text.to_s.strip
      card_meta = card.css('.course-card__meta').map(&:text).join(' - ').strip
      
      next if card_title.empty? && card_desc.empty?
      
      content = [card_title, card_meta, card_desc].reject(&:empty?).join(' - ')
      
      # Get link to course page
      course_link = card.at_css('.course-card__link')&.[]('href').to_s
      
      # Create entry for course card
      entry = {
        'title' => card_title.empty? ? "Teaching course" : card_title,
        'content' => content,
        'url' => course_link.empty? ? url : course_link,
        'type' => 'teaching_course',
        'priority' => 2
      }
      search_db << entry
    end
  end

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
        'url' => "#{url}##{generate_anchor(name)}",
        'type' => 'team_member',
        'priority' => 2  # Medium priority for team members
      }
      search_db << entry
    end
  end

  # Special handling for research papers (h3 with tags)
  doc.css('h3').each do |heading|
    next if heading.text.strip.empty?

    # Find the next tags element after this heading
    tags_element = heading.xpath('following-sibling::tags[1]')
    next unless tags_element.any?

    # Get tags
    tags = tags_element.css('span').map(&:text).map(&:strip)

    # Get content between this heading and the next heading or tags
    content_nodes = []
    current = heading.next_element
    while current && !['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].include?(current.name) && current.name != 'tags'
      content_nodes << current.text.strip if current.text?
      current = current.next_element
    end
    content = content_nodes.join(' ').strip

    # Create entry for paper
    entry = {
      'title' => heading.text.strip,
      'content' => content,
      'url' => "#{url}##{generate_anchor(heading.text.strip)}",
      'type' => 'paper',
      'tags' => tags,
      'priority' => 3  # Lower priority for papers
    }
    search_db << entry
  end

  # Process text content in chunks
  doc.css('p').each do |para|
    # Skip if this paragraph is part of a team member or paper section
    next if para.ancestors('section').any? { |s| s['class']&.include?('team-member') }
    next if para.xpath('./preceding-sibling::tags[1]').any?
    next if para.xpath('./following-sibling::tags[1]').any?

    text = para.text.strip
    next if text.empty?

    # Extract links from this paragraph
    links = []
    para.css('a').each do |link|
      href = link['href']
      next unless href && !href.start_with?('http')
      links << href.sub(/^\//, '').sub(/\/$/, '')
    end

    # Find the nearest heading
    heading = para.xpath('./preceding::h1|./preceding::h2|./preceding::h3|./preceding::h4|./preceding::h5|./preceding::h6').last
    heading_text = heading ? heading.text.strip : title

    # Create entry for text chunk
    entry = {
      'title' => heading_text,
      'content' => text,
      'url' => "#{url}##{generate_anchor(heading_text)}",
      'type' => 'text',
      'links' => links,
      'priority' => 3  # Lower priority for regular content
    }
    search_db << entry
  end

  # Process sections with headings
  doc.css('h1, h2, h3').each do |heading|
    # Skip team members and papers
    next if heading.name == 'h2' && heading.text.strip.match?(/Ph\.D\.|Postdoc|Professor|Student/)
    next if heading.name == 'h3' && heading.xpath('following-sibling::tags[1]').any?

    heading_text = heading.text.strip
    next if heading_text.empty?

    # Get content until next heading of same or higher level
    content_nodes = []
    current = heading.next_element
    while current && !(current.name == heading.name || (current.name[1].to_i < heading.name[1].to_i && current.name.match?(/h[1-6]/)))
      if current.text?
        content_nodes << current.text.strip
      elsif current.name == 'p' || current.name == 'ul' || current.name == 'ol'
        content_nodes << current.text.strip
      end
      current = current.next_element
    end
    content = content_nodes.join(' ').strip
    next if content.empty?

    # Extract links
    links = []
    heading.parent.css('a').each do |link|
      href = link['href']
      next unless href && !href.start_with?('http')
      links << href.sub(/^\//, '').sub(/\/$/, '')
    end

    # Create entry for section
    entry = {
      'title' => heading_text,
      'content' => content,
      'url' => "#{url}##{generate_anchor(heading_text)}",
      'type' => 'section',
      'links' => links,
      'priority' => 3  # Lower priority for regular content
    }
    search_db << entry
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
