# frozen_string_literal: true

require 'json'
require 'nokogiri'

# Add intrinsic width/height, lazy-load below-the-fold images, and
# point modern browsers at the WebP siblings from scripts/optimize-images.py.
module CoMPhyResponsiveImages
  module_function

  def load_manifest(source)
    path = File.join(source, 'assets', 'image-variants.json')
    return {} unless File.file?(path)

    JSON.parse(File.read(path, encoding: 'UTF-8'))
  end

  def class_chain(node)
    classes = []
    current = node
    while current.respond_to?(:parent) && current.parent
      classes << current['class'].to_s
      current = current.parent
    end
    classes.join(' ')
  end

  def in_header?(img)
    class_chain(img).include?('s-header')
  end

  def sizes_for(img)
    chain = class_chain(img)
    return '98px' if chain.include?('s-header__logo') || chain.include?('c-footer__mark')
    return '88px' if chain.include?('news-item__thumb')
    return '180px' if chain.include?('c-footer__partners') || chain.include?('footer-logo')
    return '(max-width: 700px) 46vw, 280px' if chain.include?('t-member__photo') || chain.include?('member__photo')
    return '(max-width: 980px) 100vw, 560px' if chain.include?('hero__image-well')
    return '(max-width: 820px) 100vw, 640px' if chain.include?('r-theme__figure') || chain.include?('theme__figure')

    '(max-width: 900px) 92vw, 640px'
  end

  def local_asset_path(value)
    return nil if value.nil? || value.empty?
    return nil if value.start_with?('data:', 'http://', 'https://', '//')

    path = value.split('?').first.split('#').first
    return nil unless path.start_with?('/assets/')
    return nil unless path.match?(/\.(?:png|jpe?g|gif|webp)\z/i)

    path
  end

  def apply_dimensions(img, info)
    return unless info
    return if img['width'] && img['height']

    img['width'] = info['width'].to_s
    img['height'] = info['height'].to_s
  end

  def apply_loading(img)
    return if img['loading']
    return if img['fetchpriority'] == 'high'

    img['loading'] = in_header?(img) ? 'eager' : 'lazy'
  end

  def wrap_picture(img, info)
    sources = info && info['sources']
    return if sources.nil? || sources.empty?
    return if img.parent && img.parent.name == 'picture'

    picture = Nokogiri::XML::Node.new('picture', img.document)
    source = Nokogiri::XML::Node.new('source', img.document)
    source['type'] = 'image/webp'
    source['sizes'] = sizes_for(img)
    source['srcset'] = sources.map { |item| "#{item['src']} #{item['width']}w" }.join(', ')
    img.add_previous_sibling(picture)
    picture.add_child(source)
    picture.add_child(img)
  end

  def rewrite_html(html, manifest)
    document = Nokogiri::HTML(html)
    modified = false
    document.css('img').to_a.each do |img|
      path = local_asset_path(img['src'])
      next unless path

      info = manifest[path]
      before = img.to_html
      apply_dimensions(img, info)
      img['decoding'] ||= 'async'
      apply_loading(img)
      wrap_picture(img, info)
      modified = true if img.to_html != before || (img.parent && img.parent.name == 'picture')
    end

    document.css('img[fetchpriority="high"]').each do |img|
      source = img.previous_element
      next unless source && source.name == 'source' && source['srcset']

      preload = Nokogiri::XML::Node.new('link', document)
      preload['rel'] = 'preload'
      preload['as'] = 'image'
      preload['type'] = 'image/webp'
      preload['imagesrcset'] = source['srcset']
      preload['imagesizes'] = source['sizes']
      preload['fetchpriority'] = 'high'
      head = document.at_css('head')
      head.add_child(preload) if head
      modified = true
    end

    document.css('video[poster]').each do |video|
      path = local_asset_path(video['poster'])
      next unless path

      sources = manifest.dig(path, 'sources')
      next if sources.nil? || sources.empty?

      largest = sources.max_by { |item| item['width'] }
      next if largest.nil? || video['poster'] == largest['src']

      video['poster'] = largest['src']
      modified = true
    end

    modified ? document.to_html : nil
  end

  def rewrite_destination(destination, source)
    manifest = load_manifest(source)
    return 0 if manifest.empty?

    changed = 0
    Dir.glob(File.join(destination, '**', '*.html')).sort.each do |path|
      original = File.read(path, encoding: 'UTF-8')
      updated = rewrite_html(original, manifest)
      next if updated.nil? || updated == original

      File.write(path, updated, encoding: 'UTF-8')
      changed += 1
    end
    changed
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  count = CoMPhyResponsiveImages.rewrite_destination(site.dest, site.source)
  Jekyll.logger.info 'Responsive images:', "updated #{count} built HTML pages"
end
