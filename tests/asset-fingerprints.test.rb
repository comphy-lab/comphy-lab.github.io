#!/usr/bin/env ruby

require 'digest'
require 'fileutils'
require 'jekyll'
require 'nokogiri'
require 'tmpdir'
require 'uri'
require_relative '../_plugins/asset_fingerprints'

def assert(condition, message)
  raise message unless condition
end

def asset_urls(path)
  document = Nokogiri::HTML(File.read(path))
  document.css('script[src], link[href]').map { |node| node['src'] || node['href'] }
end

Dir.mktmpdir('comphy-asset-fingerprints') do |directory|
  source = File.join(directory, 'source')
  destination = File.join(directory, 'output')
  FileUtils.mkdir_p(File.join(source, 'assets', 'js'))
  FileUtils.mkdir_p(File.join(source, 'assets', 'css'))
  js = File.join(source, 'assets', 'js', 'utils.js')
  css = File.join(source, 'assets', 'css', 'styles.css')
  File.write(js, 'window.existingCode = true;')
  File.write(css, 'body { color: black; }')
  File.write(File.join(source, 'index.html'), <<~HTML)
    ---
    ---
    <!doctype html><html><head>
    <link rel="stylesheet" href="/assets/css/styles.css?theme=shared#rules">
    <link rel="preload" href="/assets/js/utils.js" as="script">
    <link rel="stylesheet" href="https://cdn.example.org/style.css">
    <link rel="stylesheet" href="//cdn.example.org/style.css">
    <link rel="stylesheet" href="data:text/css,body%7Bcolor:red%7D">
    <script data-cfasync="false" src="/assets/js/utils.js"></script>
    <script defer data-cfasync="false" src="/assets/js/utils.js"></script>
    <script type="application/json">{"sample":"/assets/js/utils.js"}</script>
    </head><body><a href="/assets/js/utils.js">Download</a></body></html>
  HTML
  config = Jekyll.configuration(
    'source' => source, 'destination' => destination, 'quiet' => true,
    'plugins_dir' => File.join(directory, 'no-plugins')
  )
  Jekyll::Site.new(config).process
  page = File.join(destination, 'index.html')
  initial = asset_urls(page)
  js_hash = Digest::SHA256.file(js).hexdigest
  css_hash = Digest::SHA256.file(css).hexdigest
  assert(initial.include?("/assets/js/utils.js?v=#{js_hash}"), 'script URL is not bound to emitted bytes')
  assert(initial.include?("/assets/css/styles.css?theme=shared&v=#{css_hash}#rules"), 'stylesheet query/fragment lost')
  assert(initial.count("/assets/js/utils.js?v=#{js_hash}") == 3, 'preload and both native script tags disagree')
  assert(initial.include?('https://cdn.example.org/style.css'), 'remote URL was modified')
  assert(initial.include?('//cdn.example.org/style.css'), 'protocol-relative URL was modified')
  assert(initial.include?('data:text/css,body%7Bcolor:red%7D'), 'data URL was modified')
  document = Nokogiri::HTML(File.read(page))
  document.css('script[src]').each do |node|
    attrs = node.attribute_nodes.map(&:name)
    assert(node['data-cfasync'] == 'false', 'Rocket Loader opt-out was removed')
    assert(attrs.index('data-cfasync') < attrs.index('src'), 'opt-out moved after src')
  end
  assert(document.at_css('script[type="application/json"]').text == '{"sample":"/assets/js/utils.js"}', 'JSON data changed')
  assert(document.at_css('a')['href'] == '/assets/js/utils.js', 'download link changed')
  assert(File.read(File.join(destination, 'assets/js/utils.js')) == File.read(js), 'source filename or bytes changed')
  assert(CoMPhyAssetFingerprints.rewrite_destination(destination).zero?, 'a second pass is not idempotent')
  changed_query = CoMPhyAssetFingerprints.version_url('/assets/js/utils.js?v=old&mode=lab#top', destination, {})
  assert(changed_query == "/assets/js/utils.js?mode=lab&v=#{js_hash}#top", 'old fingerprint or other query values mishandled')
  untouched = CoMPhyAssetFingerprints.version_url('javascript:alert(1)', destination, {})
  assert(untouched == 'javascript:alert(1)', 'unsafe URL was rewritten into a trusted asset')

  File.write(js, 'window.repairedCode = true;')
  # Jekyll skips copying static files with the same integer mtime. Advance the
  # fixture's time so this second build actually emits the changed source.
  File.utime(Time.now + 2, Time.now + 2, js)
  Jekyll::Site.new(config).process
  updated = asset_urls(page)
  new_hash = Digest::SHA256.file(js).hexdigest
  assert(updated.include?("/assets/js/utils.js?v=#{new_hash}"), 'new script bytes did not get a new browser cache key')
  assert(!updated.include?("/assets/js/utils.js?v=#{js_hash}"), 'stale script cache key remains in new HTML')
  assert(updated.find { |url| url.start_with?('/assets/css/') } == initial.find { |url| url.start_with?('/assets/css/') }, 'unchanged CSS fingerprint drifted')

  ['../secret.js', '%2e%2e/secret.js', 'missing.js'].each do |name|
    begin
      CoMPhyAssetFingerprints.version_url("/assets/#{name}", destination, {})
      raise "unsafe or missing asset accepted: #{name}"
    rescue ArgumentError
      # Bad references fail the build instead of publishing an unversioned URL.
    end
  end
  linked = File.join(destination, 'assets/js/linked.js')
  File.symlink(js, linked)
  begin
    CoMPhyAssetFingerprints.version_url('/assets/js/linked.js', destination, {})
    raise 'symlink escaping the built root was accepted'
  rescue ArgumentError
    # Asset hashing never reads source or another tree through a symlink.
  end
end

puts 'Asset fingerprint build/cache regression tests passed'
