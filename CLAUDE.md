# Build and Development Commands

- **Install dependencies:** `bundle install && cd scripts && npm install && cd ..`
- **Build site and search database:** `./scripts/build.sh`
- **Run local server:** `bundle exec jekyll serve` (don't run this automatically, user will do manually)
- **Fetch blog content:** `cd scripts && npm run fetch-github && cd ..`
- **Generate search database:** `ruby scripts/generate_search_db.rb`

# Repository Guidelines

- Refer to README.md to understand the codebase structure and organization
- After adding or deleting files, update README.md accordingly
- Keep README.md up-to-date whenever changes affect what's documented there
- Templates are in _layouts/*.html with corresponding CSS files:
  - default.html uses styles.css in /assets/css
  - research.html uses research.css
  - team.html uses team.css
  - All layouts use styles.css as base styling

# Code Style Guidelines

## General
- Use 2-space indentation across all files
- Follow DRY principles: reuse components, variables, and styles
- Add comments for complex logic, but keep code self-documenting
- Support both light and dark themes for all new features and changes
  - Test all UI changes in both themes before committing
  - Use CSS variables for theme-specific colors (defined in styles.css)

## HTML/Markdown
- Use semantic HTML elements
- Follow BEM naming convention for CSS classes (e.g., `s-header__nav-list`)
- Keep content files in markdown format where possible

## CSS
- Use CSS variables for colors and typography (defined in `:root`)
- Use responsive breakpoints at 1700px, 1300px, 900px, 768px, 500px
- Use `rem` units for font sizes and spacing
- Follow mobile-first approach for media queries
- Implement dark theme styles using the [data-theme="dark"] selector
- Theme colors are defined in styles.css and page-specific CSS files

## JavaScript
- Use ES6+ features (arrow functions, const/let, template literals)
- Always include 'use strict' mode
- Use async/await for asynchronous operations
- Implement error handling with try/catch blocks
- Use camelCase for variable and function names
- Prefer event delegation for multiple similar elements

## Images
- Optimize images for web (compress to reduce file size)
- Follow naming convention: `[name]-[descriptor].[extension]`
- Include alt text for all images