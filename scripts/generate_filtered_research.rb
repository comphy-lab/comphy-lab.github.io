#!/usr/bin/env ruby
require 'nokogiri'
require 'fileutils'

# Path to the built research page
research_page_path = File.join(Dir.pwd, '_site', 'research', 'index.html')

# Output directory for filtered pages
filtered_dir = File.join(Dir.pwd, '_site', 'research', 'tags')
FileUtils.mkdir_p(filtered_dir)

# Read the research page
html = File.read(research_page_path)
doc = Nokogiri::HTML(html)

# Find all unique tags
all_tags = []
doc.css('tags span').each do |tag|
  all_tags << tag.text unless all_tags.include?(tag.text)
end

puts "Found #{all_tags.length} unique tags: #{all_tags.join(', ')}"

# Create filtered pages for each tag
all_tags.each do |tag|
  # Clone the document for this tag
  tag_doc = Nokogiri::HTML(html)
  
  # Find all paper containers
  paper_containers = tag_doc.css('.paper-container')
  
  # Hide paper containers that don't contain the current tag
  paper_containers.each do |container|
    container_tags = container.css('tags')
    if container_tags.empty? || !container_tags.text.include?(tag)
      container['class'] = "#{container['class']} hidden"
    end
  end
  
  # Highlight the current tag in the tag list and convert tags to links
  tag_doc.css('tags span').each do |span|
    tag_text = span.text
    tag_slug = tag_text.downcase.gsub(/\s+/, '-')
    
    # Create a link element
    link = tag_doc.create_element('a')
    link['href'] = "/research/tags/#{tag_slug}.html"
    
    # Preserve existing classes
    span_classes = span['class'] || ""
    
    # Add active class if this is the current tag
    if tag_text == tag
      span_classes = "#{span_classes} active".strip
    end
    
    link['class'] = "#{span_classes} tag-link".strip
    link.inner_html = span.inner_html
    
    # Replace the span with the link
    span.replace(link)
  end
  
  # Add a note about the active filter
  filter_note = tag_doc.create_element('div')
  filter_note['class'] = 'filter-note'
  filter_note.inner_html = "<p>Currently filtered by tag: <strong>#{tag}</strong> <a href=\"/research/\">Clear filter</a></p>"
  
  # Insert the filter note after the tag list section
  tag_list_section = tag_doc.at_css('tags').parent
  tag_list_section.add_next_sibling(filter_note)
  
  # Write the filtered page
  output_path = File.join(filtered_dir, "#{tag.downcase.gsub(/\s+/, '-')}.html")
  File.write(output_path, tag_doc.to_html)
  puts "Created filtered page for tag '#{tag}' at #{output_path}"
end

# Create a tag index page
index_html = <<~HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0;url=/research/">
  <title>Research Tags</title>
</head>
<body>
  <p>Redirecting to <a href="/research/">research page</a>...</p>
</body>
</html>
HTML

index_path = File.join(filtered_dir, 'index.html')
File.write(index_path, index_html)
puts "Created tags index page at #{index_path}"

# Modify the original research page to link to the pre-filtered pages
original_doc = Nokogiri::HTML(html)
original_doc.css('tags span').each do |span|
  tag_text = span.text
  tag_slug = tag_text.downcase.gsub(/\s+/, '-')
  
  # Create a link element
  link = original_doc.create_element('a')
  link['href'] = "/research/tags/#{tag_slug}.html"
  
  # Preserve any existing classes and add tag-link
  span_classes = span['class'] || ""
  link['class'] = "#{span_classes} tag-link".strip
  
  link.inner_html = span.inner_html
  
  # Replace the span with the link
  span.replace(link)
end

# Write the modified original page
File.write(research_page_path, original_doc.to_html)
puts "Updated original research page with links to filtered pages"

puts "Successfully generated all filtered research pages!"