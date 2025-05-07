---
trigger: model_decision
description: whenever any *.css file is changed
globs: 
---
## Introduction

These guidelines establish consistent CSS coding practices, ensuring maintainable and responsive styles across the website.

## Guidelines

### CSS Variables
- Define colors and typography in `:root`
```css
:root {
  --primary-color: #007bff;
  --font-family-base: 'Arial', sans-serif;
  --spacing-unit: 1rem;
}
```

### Responsive Design
- Use mobile-first approach for media queries
- Implement breakpoints at:
  - 500px (mobile)
  - 768px (tablet portrait)
  - 900px (tablet landscape)
  - 1300px (desktop)
  - 1700px (large desktop)
  
### Units and Measurements
- Use `rem` units for font sizes and spacing
- Use relative units for flexible layouts
- Use percentages for fluid widths

### Example Media Query Structure
```css
/* Mobile first base styles */
.component {
  width: 100%;
}

/* Tablet portrait */
@media (min-width: 768px) {
  .component {
    width: 50%;
  }
}

/* Desktop */
@media (min-width: 1300px) {
  .component {
    width: 33.33%;
  }
}
```

## Common Pitfalls
- Using pixel units instead of relative units
- Not following mobile-first approach
- Hardcoding colors and typography instead of using CSS variables
- Inconsistent breakpoint usage 