#!/usr/bin/env ruby

require 'fileutils'
require 'nokogiri'
require 'open3'
require 'rbconfig'
require 'tmpdir'

ROOT = File.expand_path('..', __dir__)
GENERATOR = File.join(ROOT, 'scripts', 'generate_filtered_research.rb')
SITEMAP_SENTINEL = <<~XML.freeze
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://comphy-lab.org/sentinel/</loc></url>
  </urlset>
XML

def assert(condition, message)
  raise message unless condition
end

def site_with_tags(tags)
  Dir.mktmpdir('research-tag-test') do |directory|
    research_dir = File.join(directory, '_site', 'research')
    FileUtils.mkdir_p(research_dir)
    spans = tags.map { |tag| "<span>#{tag}</span>" }.join
    File.write(
      File.join(research_dir, 'index.html'),
      "<!doctype html><html><head></head><body><div class=\"tags\">#{spans}</div></body></html>"
    )
    sitemap_path = File.join(directory, '_site', 'sitemap.xml')
    File.write(sitemap_path, SITEMAP_SENTINEL)
    yield directory, sitemap_path
  end
end

def run_generator(directory)
  Open3.capture3(RbConfig.ruby, GENERATOR, chdir: directory)
end

site_with_tags(['A+B', 'A B']) do |directory, sitemap_path|
  _stdout, stderr, status = run_generator(directory)
  assert(!status.success?, 'colliding tags unexpectedly succeeded')
  assert(
    stderr.include?('Distinct tags share a generated filename: a-b'),
    "collision error did not identify the shared slug: #{stderr}"
  )
  assert(
    File.read(sitemap_path) == SITEMAP_SENTINEL,
    'collision failure modified the existing sitemap'
  )
end

site_with_tags(['A+B', 'C D']) do |directory, sitemap_path|
  _stdout, stderr, status = run_generator(directory)
  assert(status.success?, "distinct tags failed: #{stderr}")

  tags_dir = File.join(directory, '_site', 'research', 'tags')
  redirects = %w[a-b.html c-d.html].map { |name| File.join(tags_dir, name) }
  assert(redirects.all? { |path| File.file?(path) }, 'canonical redirects are missing')
  assert(redirects.uniq.length == redirects.length, 'redirect filenames are not unique')

  sitemap = Nokogiri::XML(File.read(sitemap_path))
  locations = sitemap.xpath('//*[local-name()="loc"]').map(&:text)
  expected = %w[
    https://comphy-lab.org/research/tags/a-b.html
    https://comphy-lab.org/research/tags/c-d.html
  ]
  assert(
    expected.all? { |location| locations.count(location) == 1 },
    'distinct tag redirects were not uniquely added to the sitemap'
  )
end

puts 'Research tag collision tests passed'
