#!/usr/bin/env ruby
require 'json'
require 'nokogiri'
require 'fileutils'
require 'yaml'

# Get the project root directory (one level up from scripts)
ROOT_DIR = File.expand_path('..', __dir__)

# Output path for search database
SEARCH_DB_PATH = File.join(ROOT_DIR, 'assets', 'js', 'search_db.json')

# Site directory with built files
SITE_DIR = File.join(ROOT_DIR, '_site')

# Base URL from config
config_path = File.join(ROOT_DIR, '_config.yml')
site_config = YAML.load_file(config_path) if File.exist?(config_path)
SITE_URL = site_config['url'] || 'https://comphy-lab.org'

puts "Generating search database..."

# Initialize search database array
search_db = []

# Helper function to normalize text
def normalize_text(text)
  text.to_s.gsub(/\s+/, ' ').strip
end

# Helper function to get content type from path
def get_content_type(path)
  if path.include?('/research/')
    'research'
  elsif path.include?('/team/')
    'team'
  elsif path.include?('/teaching/')
    'teaching'
  elsif path.include?('/join')
    'join'
  elsif path.match?(/\/(index\.html)?$/)
    'home'
  else
    'page'
  end
end

# Process HTML files
def process_html_files(site_dir, search_db)
  count = 0
  Dir.glob(File.join(site_dir, '**', '*.html')).each do |file_path|
    # Skip files in tags directory (these are just redirects)
    next if file_path.include?('/tags/')
    
    # Determine the relative URL
    relative_path = file_path.sub(site_dir, '').sub(/^\//, '')
    url = "/#{relative_path}"
    
    # Skip 404 pages
    next if url.include?('404.html')
    
    # Read the file
    begin
      html = File.read(file_path)
      doc = Nokogiri::HTML(html)
      
      # Get the title
      title = doc.at_css('title')&.text || File.basename(file_path, '.html').capitalize
      title = normalize_text(title)
      
      # Extract description from meta tag
      description = doc.at_css('meta[name="description"]')&.[]('content') || ''
      description = normalize_text(description)
      
      # Get content type based on URL
      content_type = get_content_type(url)
      
      # Extract main content based on common layouts
      main_content = ''
      
      # Try different content selectors based on common layouts
      content_selectors = [
        'main', '.s-content', '.main-content', 
        'article', '.post-content', '.entry-content',
        '#about-content', '#research-content', '#news-content'
      ]
      
      content_element = nil
      content_selectors.each do |selector|
        content_element = doc.at_css(selector)
        break if content_element
      end
      
      # If we found a content element, extract text
      if content_element
        main_content = content_element.text
      else
        # Fallback to body content, excluding headers and footers
        body = doc.at_css('body')
        if body
          # Skip header, footer, nav elements
          main_content = body.text
          %w[header footer nav].each do |tag|
            body.css(tag).each do |el|
              main_content = main_content.gsub(el.text, '')
            end
          end
        end
      end
      
      # Extract tags from meta keywords or tags elements
      meta_keywords = doc.at_css('meta[name="keywords"]')&.[]('content') || ''
      tag_spans = doc.css('tags span').map(&:text)
      all_tags = (meta_keywords.split(/,\s*/) + tag_spans).uniq
      
      # Create search entry
      search_entry = {
        title: title,
        url: url,
        content: normalize_text(main_content),
        description: description,
        type: content_type,
        tags: all_tags
      }
      
      # Add to search database
      search_db << search_entry
      count += 1
      
      # Debug output
      puts "Added to search database: #{url}" if ENV['DEBUG']
    rescue => e
      puts "Error processing #{file_path}: #{e.message}"
    end
  end
  
  count
end

# Process markdown files directly from _research directory
def process_research_content(root_dir, search_db)
  research_dir = File.join(root_dir, '_research')
  count = 0
  
  # Skip if directory doesn't exist
  return count unless Dir.exist?(research_dir)
  
  Dir.glob(File.join(research_dir, '*.md')).each do |file_path|
    begin
      content = File.read(file_path)
      
      # Extract front matter
      front_matter = {}
      if content =~ /\A---\s*\n(.*?)\n---\s*\n/m
        front_matter_yaml = $1
        begin
          front_matter = YAML.safe_load(front_matter_yaml)
        rescue => e
          puts "Error parsing front matter in #{file_path}: #{e.message}"
        end
      end
      
      # Extract content (everything after the front matter)
      markdown_content = content.sub(/\A---\s*\n.*?\n---\s*\n/m, '')
      
      # For each research paper in the markdown, create a separate entry
      paper_sections = markdown_content.split(/^### \[\d+\]/)
      
      paper_sections.each_with_index do |section, index|
        next if index == 0 && section.strip.empty?
        
        # Extract paper number
        paper_number = nil
        if index > 0
          # The section text doesn't include the header, so look at the previous line
          paper_number = $&.match(/\[(\d+)\]/)[1] if markdown_content =~ /### \[(\d+)\]/
        end
        
        # Extract title (first line or part until first newline)
        title = section.strip.split("\n").first
        
        # Extract tags if any
        tags = []
        section.scan(/tags: <span>(.*?)<\/span>/) do |match|
          tags << match[0].strip
        end
        
        # Create URL with anchor if we have a paper number
        url = paper_number ? "/research/##{paper_number}" : "/research/"
        
        # Create search entry for this paper
        search_entry = {
          title: normalize_text(title || "Research Paper"),
          url: url,
          content: normalize_text(section),
          type: 'research_paper',
          tags: tags,
          priority: 2 # Higher priority for research papers
        }
        
        # Add to search database
        search_db << search_entry
        count += 1
        
        puts "Added research paper to search database: #{url}#{paper_number ? '#' + paper_number : ''}" if ENV['DEBUG']
      end
    rescue => e
      puts "Error processing research content in #{file_path}: #{e.message}"
    end
  end
  
  count
end

# Process team members directly from _team directory
def process_team_content(root_dir, search_db)
  team_dir = File.join(root_dir, '_team')
  count = 0
  
  # Skip if directory doesn't exist
  return count unless Dir.exist?(team_dir)
  
  Dir.glob(File.join(team_dir, '*.md')).each do |file_path|
    begin
      content = File.read(file_path)
      
      # Extract member sections
      member_sections = content.split(/^## /)
      
      member_sections.each_with_index do |section, index|
        next if index == 0 && !section.include?('##') # Skip intro content
        
        # Extract name (first line or part until first newline)
        name = section.strip.split("\n").first
        
        # Create search entry for this team member
        search_entry = {
          title: normalize_text(name || "Team Member"),
          url: "/team/",
          content: normalize_text(section),
          type: 'team_member',
          tags: ['team', 'member', 'researcher'],
          priority: 3 # Medium priority for team members
        }
        
        # Add to search database
        search_db << search_entry
        count += 1
        
        puts "Added team member to search database: #{name}" if ENV['DEBUG']
      end
    rescue => e
      puts "Error processing team content in #{file_path}: #{e.message}"
    end
  end
  
  count
end

# Process teaching courses directly from _teaching directory
def process_teaching_content(root_dir, search_db)
  teaching_dir = File.join(root_dir, '_teaching')
  count = 0
  
  # Skip if directory doesn't exist
  return count unless Dir.exist?(teaching_dir)
  
  Dir.glob(File.join(teaching_dir, '*.md')).each do |file_path|
    begin
      # Skip index file
      next if File.basename(file_path) == 'index.md'
      
      content = File.read(file_path)
      
      # Extract front matter
      front_matter = {}
      if content =~ /\A---\s*\n(.*?)\n---\s*\n/m
        front_matter_yaml = $1
        begin
          front_matter = YAML.safe_load(front_matter_yaml)
        rescue => e
          puts "Error parsing front matter in #{file_path}: #{e.message}"
        end
      end
      
      # Extract content (everything after the front matter)
      markdown_content = content.sub(/\A---\s*\n.*?\n---\s*\n/m, '')
      
      # Get course ID from filename
      course_id = File.basename(file_path, '.md')
      
      # Get course title from front matter or fallback to filename
      title = front_matter['title'] || course_id.gsub(/-/, ' ').capitalize
      
      # Create search entry for this course
      url = "/teaching/#{course_id.gsub(/^\d+-/, '')}"
      search_entry = {
        title: normalize_text(title),
        url: url,
        content: normalize_text(markdown_content),
        type: 'course',
        tags: ['teaching', 'course', front_matter['location']].compact,
        priority: 3 # Medium priority for courses
      }
      
      # Add to search database
      search_db << search_entry
      count += 1
      
      puts "Added course to search database: #{title}" if ENV['DEBUG']
    rescue => e
      puts "Error processing teaching content in #{file_path}: #{e.message}"
    end
  end
  
  count
end

# Main processing
html_count = process_html_files(SITE_DIR, search_db)
puts "Processed #{html_count} HTML files"

research_count = process_research_content(ROOT_DIR, search_db)
puts "Processed #{research_count} research paper sections"

team_count = process_team_content(ROOT_DIR, search_db)
puts "Processed #{team_count} team member sections"

teaching_count = process_teaching_content(ROOT_DIR, search_db)
puts "Processed #{teaching_count} teaching courses"

# Add high-priority entries for main sections
main_sections = [
  { title: "Research", url: "/research", type: "section", priority: 1 },
  { title: "Team", url: "/team/", type: "section", priority: 1 },
  { title: "Teaching", url: "/teaching", type: "section", priority: 1 },
  { title: "Join Us", url: "/join", type: "section", priority: 1 },
  { title: "About", url: "/#about", type: "section", priority: 1 },
  { title: "News", url: "/#news", type: "section", priority: 1 }
]

search_db.concat(main_sections)
puts "Added #{main_sections.length} high-priority section entries"

# Write the search database to file
FileUtils.mkdir_p(File.dirname(SEARCH_DB_PATH))
File.write(SEARCH_DB_PATH, JSON.pretty_generate(search_db))

puts "Successfully generated search database with #{search_db.length} entries at #{SEARCH_DB_PATH}"