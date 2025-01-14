#!/bin/bash

# Create optimized versions of images
for img in assets/images/team/*.{jpg,png,webp}; do
  # Create small version (250px)
  convert "$img" -resize 250x250^ -gravity center -extent 250x250 "${img%.*}-small.webp"
  
  # Create medium version (500px)
  convert "$img" -resize 500x500^ -gravity center -extent 500x500 "${img%.*}-medium.webp"
  
  # Convert original to WebP if not already
  if [[ "${img##*.}" != "webp" ]]; then
    convert "$img" -resize 800x800^ -gravity center -extent 800x800 "${img%.*}.webp"
  fi
done 