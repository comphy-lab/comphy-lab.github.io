#!/usr/bin/env ruby
# frozen_string_literal: true

require 'jekyll'
require 'nokogiri'
require_relative '../_plugins/responsive_images'

def assert(condition, message)
  raise message unless condition
end

def img_node(html)
  Nokogiri::HTML.fragment(html).at_css('img')
end

INFO = { 'width' => 2391, 'height' => 2090 }.freeze

# Neither attr: set both intrinsic dims (CLS / first-paint intent of #147).
bare = img_node('<img src="/assets/images/research/fig.png">')
CoMPhyResponsiveImages.apply_dimensions(bare, INFO)
assert(bare['width'] == '2391', 'bare img should get natural width')
assert(bare['height'] == '2090', 'bare img should get natural height')

# Author percentage width, no height: never overwrite width or invent height.
pct = img_node(
  '<img src="/assets/images/research/fig.png" width="75%">'
)
CoMPhyResponsiveImages.apply_dimensions(pct, INFO)
assert(pct['width'] == '75%', 'percentage width must be preserved')
assert(pct['height'].nil?, 'percentage width must not get a pixel height')

# Numeric width without height: keep width, scale height.
num = img_node(
  '<img src="/assets/images/research/fig.png" width="800">'
)
CoMPhyResponsiveImages.apply_dimensions(num, INFO)
assert(num['width'] == '800', 'numeric author width must be preserved')
expected_h = ((800.0 * 2090) / 2391).round
assert(
  num['height'] == expected_h.to_s,
  "expected proportional height #{expected_h}, got #{num['height']}"
)

# Both already set: leave untouched.
both = img_node(
  '<img src="/assets/images/research/fig.png" width="400" height="300">'
)
CoMPhyResponsiveImages.apply_dimensions(both, INFO)
assert(both['width'] == '400', 'existing width must not change')
assert(both['height'] == '300', 'existing height must not change')

# Numeric height without width: keep height, scale width.
h_only = img_node(
  '<img src="/assets/images/research/fig.png" height="1045">'
)
CoMPhyResponsiveImages.apply_dimensions(h_only, INFO)
assert(h_only['height'] == '1045', 'numeric author height must be preserved')
expected_w = ((1045.0 * 2391) / 2090).round
assert(
  h_only['width'] == expected_w.to_s,
  "expected proportional width #{expected_w}, got #{h_only['width']}"
)

# Nil info is a no-op.
noop = img_node('<img src="/assets/images/research/fig.png">')
CoMPhyResponsiveImages.apply_dimensions(noop, nil)
assert(noop['width'].nil? && noop['height'].nil?, 'nil info must no-op')

puts 'responsive-images.test.rb: all assertions passed'
