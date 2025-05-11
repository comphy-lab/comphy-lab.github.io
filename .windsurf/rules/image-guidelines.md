---
trigger: model_decision
description: working with images
globs: 
---
 ## Introduction

These guidelines ensure consistent image handling, optimization, and accessibility across the website.

## Guidelines

### Image Optimization
- Compress all images to reduce file size while maintaining acceptable quality
- Choose appropriate image formats:
  - JPEG for photographs
  - PNG for images with transparency
  - SVG for icons and logos
  - WebP as a modern alternative when browser support allows

### Naming Convention
- Follow the pattern: `[name]-[descriptor].[extension]`
- Examples:
  ```
  profile-photo.jpg
  hero-banner-large.png
  icon-search.svg
  ```

### Accessibility
- Include meaningful alt text for all images
- Use empty alt="" for decorative images
- Provide descriptive filenames that indicate image content

### Example Implementation
```html
<!-- Good -->
<img 
  src="team-member-john.jpg" 
  alt="Dr. John Smith, Lead Researcher"
  width="300"
  height="400"
/>

<!-- Bad -->
<img src="IMG001.jpg" />
```

## Common Pitfalls
- Uploading uncompressed images
- Missing alt text on important images
- Using generic or numbered filenames
- Not following the naming convention
- Forgetting to specify image dimensions