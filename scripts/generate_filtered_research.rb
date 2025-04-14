#!/usr/bin/env ruby
require 'nokogiri'
require 'fileutils'
require 'cgi'

# Path to the built research page
research_page_path = File.join(Dir.pwd, '_site', 'research', 'index.html')

# Output directory for SEO-friendly tag pages that redirect to URL parameters
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

# Create a sitemap entry for each tag filter
sitemap_path = File.join(Dir.pwd, '_site', 'sitemap.xml')
if File.exist?(sitemap_path)
  sitemap = File.read(sitemap_path)
  sitemap_doc = Nokogiri::XML(sitemap)
  
  # Add entries for each tag filter
  all_tags.each do |tag|
    # Create file-safe slug (lowercase, hyphenated) for the static file paths
    file_slug = tag.downcase.gsub(/\s+/, '-')
    # Use the original tag for the URL parameter (URL-encoded)
    url_param = CGI.escape(tag)
    
    # Add URL parameter version (main one that users will use)
    url1 = sitemap_doc.create_element('url')
    loc1 = sitemap_doc.create_element('loc')
    loc1.content = "https://comphy-lab.org/research/?tag=#{url_param}"
    url1.add_child(loc1)
    sitemap_doc.at_css('urlset').add_child(url1)
    
    # Add static page version (for SEO)
    url2 = sitemap_doc.create_element('url')
    loc2 = sitemap_doc.create_element('loc')
    loc2.content = "https://comphy-lab.org/research/tags/#{file_slug}.html"
    url2.add_child(loc2)
    sitemap_doc.at_css('urlset').add_child(url2)
  end
  
  # Write the updated sitemap
  File.write(sitemap_path, sitemap_doc.to_xml)
  puts "Updated sitemap with tag filter URLs"
end

# Add meta tags for SEO to the research page
head = doc.at_css('head')
if head
  # Add meta description for the main research page if it doesn't exist
  unless head.at_css('meta[name="description"]')
    meta_desc = doc.create_element('meta')
    meta_desc['name'] = 'description'
    meta_desc['content'] = 'Research publications from the CoMPhy Lab, covering topics in fluid dynamics, soft matter, and complex systems.'
    head.add_child(meta_desc)
  end
  
  # Add meta keywords if they don't exist
  unless head.at_css('meta[name="keywords"]')
    meta_keywords = doc.create_element('meta')
    meta_keywords['name'] = 'keywords'
    meta_keywords['content'] = "#{all_tags.join(', ')}, fluid dynamics, research, publications, CoMPhy Lab"
    head.add_child(meta_keywords)
  end
end

# Write the modified research page with SEO metadata
File.write(research_page_path, doc.to_html)
puts "Updated research page with SEO metadata"

# Create SEO-friendly static HTML pages that redirect to the URL parameter version
all_tags.each do |tag|
  # Create file-safe slug for the static file path
  file_slug = tag.downcase.gsub(/\s+/, '-')
  # Use the original tag for the URL parameter (URL-encoded)
  url_param = CGI.escape(tag)
  
  # Create HTML for a page that redirects to the URL parameter version
  redirect_html = <<~HTML
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>#{tag} Research - CoMPhy Lab</title>
    <meta name="description" content="Research publications on #{tag} from the CoMPhy Lab, covering topics in fluid dynamics, soft matter, and complex systems.">
    <meta name="keywords" content="#{tag}, research, publications, fluid dynamics, CoMPhy Lab">
    <link rel="canonical" href="https://comphy-lab.org/research/?tag=#{url_param}">
    <meta http-equiv="refresh" content="0;url=/research/?tag=#{url_param}">
    <script>
      window.location.href = "/research/?tag=#{url_param}";
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="/research/?tag=#{url_param}">#{tag} research papers</a>...</p>
  </body>
  </html>
  HTML
  
  # Write the redirect page
  output_path = File.join(filtered_dir, "#{file_slug}.html")
  File.write(output_path, redirect_html)
  puts "Created SEO-friendly redirect page for tag '#{tag}' at #{output_path}"
end

# Create a tag index page
index_html = <<~HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Research Tags - CoMPhy Lab</title>
  <meta name="description" content="Browse research publications by topic from the CoMPhy Lab.">
  <meta name="keywords" content="#{all_tags.join(', ')}, research tags, publications, fluid dynamics, CoMPhy Lab">
  <link rel="canonical" href="https://comphy-lab.org/research/">
  <meta http-equiv="refresh" content="0;url=/research/">
  <script>
    window.location.href = "/research/";
  </script>
</head>
<body>
  <p>Redirecting to <a href="/research/">research page</a>...</p>
  <ul>
    #{all_tags.map { |tag| "<li><a href=\"/research/?tag=#{CGI.escape(tag)}\">#{tag}</a></li>" }.join("\n    ")}
  </ul>
</body>
</html>
HTML

index_path = File.join(filtered_dir, 'index.html')
File.write(index_path, index_html)
puts "Created tags index page at #{index_path}"

puts "Successfully enhanced SEO with redirect pages for tag filters!"