#!/usr/bin/env ruby
require 'json'
require 'nokogiri'
require 'fileutils'
require 'open-uri'
require 'net/http'

# Get the project root directory (one level up from scripts)
ROOT_DIR = File.expand_path('..', __dir__)

# Initialize search database
search_db = []

# Process markdown files first
Dir.glob(File.join(ROOT_DIR, '*.md')).each do |file|
  next if file.end_with?('README.md') # Skip README

  puts "Processing markdown file #{file}..."
  
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
    
    # Create entry for the section
    entry = {
      'title' => header,
      'content' => content,
      'url' => '/#about',
      'type' => 'markdown_section',
      'source' => File.basename(file)
    }
    search_db << entry
    
    # Also create entries for individual paragraphs
    paragraphs = content.split(/\n\n+/)
    paragraphs.each do |para|
      para = para.strip
      next if para.empty?
      next if para.start_with?('```') # Skip code blocks
      next if para.start_with?('<') # Skip HTML
      
      entry = {
        'title' => header,
        'content' => para,
        'url' => '/#about',
        'type' => 'markdown_text',
        'source' => File.basename(file)
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
      'url' => "#{url}##{heading.text.strip.downcase.gsub(/[^a-z0-9]+/, '-')}",
      'type' => 'paper',
      'tags' => tags
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
      'url' => "#{url}##{heading_text.downcase.gsub(/[^a-z0-9]+/, '-')}",
      'type' => 'text',
      'links' => links
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
      'url' => "#{url}##{heading_text.downcase.gsub(/[^a-z0-9]+/, '-')}",
      'type' => 'section',
      'links' => links
    }
    search_db << entry
  end
end

# Fetch and index external blog content
BLOG_URL = "https://blogs-comphy-lab.org"
BLOG_API_URL = "https://publish-01.obsidian.md"
BLOG_UID = "2b614a95ee2a1dd00a42a8bf3fab3099"
FETCH_DELAY = 1 # seconds between requests

def fetch_url(url, headers = {})
  uri = URI(url)
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  
  request = Net::HTTP::Get.new(uri)
  headers.each { |k,v| request[k] = v }
  request['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  request['Origin'] = BLOG_URL
  request['Accept'] = '*/*'
  
  response = http.request(request)
  
  if response.is_a?(Net::HTTPSuccess)
    response.body
  else
    puts "Failed to fetch #{url}: #{response.code} #{response.message}"
    nil
  end
end

begin
  puts "Generating search database..."
  
  # First get the main page to extract metadata
  if main_page = fetch_url(BLOG_URL)
    doc = Nokogiri::HTML(main_page)
    
    # Extract site info
    site_info = nil
    doc.css('script').each do |script|
      if script.text =~ /window\.siteInfo\s*=\s*({.*?});/m
        site_info = JSON.parse($1)
        break
      end
    end
    
    if site_info
      # Get the cache data
      cache_url = "#{BLOG_API_URL}/access/#{site_info['uid']}/0_README.md"
      if cache_data = fetch_url(cache_url, {
        'Referer' => BLOG_URL,
        'Accept' => 'text/markdown',
        'Host' => URI(BLOG_API_URL).host
      })
        # Parse the README to get structure
        sections = cache_data.split(/^#+\s+/)
        sections.each do |section|
          next if section.strip.empty?
          
          # Extract header and content
          lines = section.lines
          header = lines.first.strip
          content = lines[1..].join.strip
          
          next if header.empty? || content.empty?
          
          # Create entry for blog section
          entry = {
            'title' => header,
            'content' => content.gsub(/[*_]{1,2}([^*_]+)[*_]{1,2}/, '\1')  # Remove markdown formatting
                              .gsub(/\[([^\]]+)\]\(([^\)]+)\)/, '\1'),     # Remove links
            'url' => "#{BLOG_URL}/0_README##{header.downcase.gsub(/[^a-z0-9]+/, '-')}",
            'type' => 'blog_post'
          }
          search_db << entry
        end
      end
    end
  end
  
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
