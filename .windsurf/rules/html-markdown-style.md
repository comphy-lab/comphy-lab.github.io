---
trigger: always_on
description: 
globs: 
---
 ## Introduction

These guidelines ensure consistent and semantic markup across HTML templates and Markdown content files, promoting accessibility and maintainability.

## Guidelines

### HTML Structure
- Use semantic HTML elements appropriately
  - `<header>` for page headers
  - `<nav>` for navigation
  - `<main>` for primary content
  - `<article>` for self-contained content
  - `<section>` for thematic grouping
  - `<footer>` for page footers

### CSS Class Naming
- Follow BEM (Block Element Modifier) naming convention
  ```html
  <!-- Example of BEM naming -->
  <nav class="s-header__nav">
    <ul class="s-header__nav-list">
      <li class="s-header__nav-item">
        <a class="s-header__nav-link s-header__nav-link--active" href="#">Home</a>
      </li>
    </ul>
  </nav>
  ```

### Markdown Usage
- Keep content files in Markdown format where possible
- Use appropriate heading levels (h1-h6)
- Maintain consistent spacing between sections
- Use lists and tables for structured content

## Common Pitfalls
- Using non-semantic div elements instead of appropriate HTML5 elements
- Inconsistent BEM naming patterns
- Converting Markdown content to HTML unnecessarily
- Skipping heading levels in document structure