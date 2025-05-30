# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains the CoMPhy Lab website, a static site built with Jekyll for the Computational Multiphase Physics Laboratory. The site features research publications, team member information, teaching materials, and lab news.

## Build and Development Commands

- **Complete setup (for fresh or existing environments):**

  ```bash
  ./scripts/setup.sh
  ```
  
  This script will automatically:
  - Install Ruby via rbenv if not present
  - Install Node.js via nvm if not present
  - Install Bundler if not present
  - Install all Ruby gems and npm packages
  - Build the site and generate search database
  - Install Git hooks for pre-commit checks (via Husky)
  - Run validation tests

- **Manual dependency installation (if setup.sh was already run):**

  ```bash
  bundle install && npm install
  ```
  
- **Update dependencies:**

  ```bash
  bundle update && npm update
  ```

- **Build site and generate search database:**

  ```bash
  ./scripts/build.sh
  ```

- **Run local server:**

  ```bash
  bundle exec jekyll serve
  ```

- **View website in browser:**
  <http://localhost:4000>

- **Generate SEO tags:**

  ```bash
  bundle exec ruby scripts/generate_seo_tags.rb
  ```

- **Generate filtered research pages:**

  ```bash
  bundle exec ruby scripts/generate_filtered_research.rb
  ```
  
- **Run code checks and auto-fixes:**

  ```bash
  ./scripts/lint-check.sh
  ```

- **Run tests:**

  ```bash
  # Jest tests with coverage
  npm test -- --coverage
  
  # Simple validation tests
  node scripts/simple-test.js
  
  # Test wrapper
  ./scripts/runTests.sh
  ```

- **Fix JavaScript issues:**

  ```bash
  # Fix line length (80 chars max)
  ./scripts/fix-js-line-length.sh
  
  # Convert single to double quotes
  ./scripts/fix-quotes.sh
  
  # Fix script loading order
  ./scripts/fix-script-order.sh
  ```

## Code Organization

- **Jekyll Collections:** `_team`, `_research`, `_teaching`
- **Layouts:** Located in `_layouts/` directory with corresponding CSS files
- **Assets:** CSS, JavaScript, images, and favicon files in `assets/` directory
- **Content:** Primarily in Markdown format with HTML for complex components

## Key Features and Components

1. **Search and Command Palette:**
   - Triggered by keyboard shortcut (⌘K on Mac, ctrl+K on Windows)
   - JavaScript implementation in `assets/js/command-data.js` and `assets/js/command-palette.js`
   - CSS styling in `assets/css/command-palette.css`

2. **Theme Toggle:**
   - Light/dark mode support across all pages
   - Theme variables in `assets/css/styles.css` and page-specific CSS
   - Theme state persisted via localStorage

3. **Research Publications:**
   - Filterable by tags
   - Pre-generated SEO-friendly tag pages
   - Publication entries in `_research/index.md`

4. **Responsive Design:**
   - Breakpoints at 1700px, 1300px, 900px, 768px, 500px
   - Mobile-first approach for media queries

## Content Management Guidelines

- **Research Papers:** Add to `_research/index.md` following the established format
- **Team Members:** Modify `_team/index.md` using the existing structure
- **Teaching Content:** Add course pages to `_teaching/` directory
- **News:** Update `News.md` with new announcements

## CSS Architecture

- CSS variables for colors, typography, and spacing
- Page-specific styles in dedicated CSS files (research.css, teaching.css, team.css)
- Dark theme support via [data-theme="dark"] selector
- Mobile-first responsive design

## JavaScript Guidelines

- Use ES6+ features (arrow functions, const/let, template literals)
- Include 'use strict' mode
- Use async/await for asynchronous operations
- Implement error handling with try/catch blocks
- Use camelCase for variable and function names
- Follow proper dependency order in script loading:
  - Load command-palette.js before command-data.js
  - Load Fuse.js before any code that uses it
  - Run lint-check.sh to automatically fix order issues

## Pre-commit Hooks

This repository uses Husky and lint-staged for automatic code quality checks:

- **Automatic Installation**: Hooks are installed automatically when you run `./scripts/setup.sh`
- **What Gets Checked**: Only staged files are checked before commit
- **JavaScript**: ESLint (with auto-fix) + Prettier formatting
- **CSS**: Prettier formatting
- **Markdown**: markdownlint-cli2 validation
- **JSON/YAML**: Prettier formatting

If a commit fails due to linting errors:
1. Review the error messages
2. Fix any issues that couldn't be auto-fixed
3. Stage the fixes: `git add .`
4. Retry the commit

To bypass hooks in emergencies: `git commit --no-verify`

## Scripts Overview

### Core Scripts

- **setup.sh** - Complete environment setup (installs Ruby/Node.js if needed)
- **build.sh** - Builds site, generates search database, SEO tags, and filtered pages
- **lint-check.sh** - Runs all linters and auto-fixes issues

### Utility Scripts

- **fix-js-line-length.sh** - Ensures JS files stay within 80 character limit
- **fix-quotes.sh** - Standardizes quotes in JavaScript files
- **fix-script-order.sh** - Fixes script dependency loading order
- **simple-test.js** - Lightweight test runner for basic validation
- **runTests.sh** - Wrapper for running npm tests

### Ruby Scripts

- **generate_seo_tags.rb** - Creates SEO meta tags for all pages
- **generate_filtered_research.rb** - Generates tag-based research filter pages

## Testing

### Running Tests

- Use `npm test` for full Jest test suite
- Use `npm test -- --coverage` for coverage report
- Use `node scripts/simple-test.js` for quick validation
- Tests are located in `/tests` directory

### Test Files

- **command-data.test.js** - Tests command palette functionality
- **fix-line-length.test.js** - Tests line breaking utilities
- **platform-utils.test.js** - Tests platform detection
- **shortcut-key.test.js** - Tests keyboard shortcuts
- **teaching.test.js** - Tests course sorting
- **setup.js** - Browser environment mocks

### Writing Tests

- Follow existing patterns in test files
- Mock browser APIs using setup.js
- Aim for 80%+ code coverage
- Test edge cases and error handling

## Deployment Process

- Site is automatically deployed via GitHub Pages when changes are merged to main
- GitHub Actions workflows trigger the build and deployment process
- Cloudflare cache is purged automatically on deployment

## Important Instructions

### Setup Process

- **Always use `./scripts/setup.sh` for environment setup** - This single script handles both fresh installations and existing environments
- Do not create separate setup scripts - everything is consolidated in setup.sh
- The script automatically installs Ruby/Node.js if not present

### File Management

- ALWAYS prefer editing existing files over creating new ones
- NEVER proactively create documentation files unless explicitly requested
- Do what has been asked; nothing more, nothing less

### Development Workflow

1. Run `./scripts/setup.sh` for initial setup
2. Use `./scripts/build.sh` to build the site
3. Run `bundle exec jekyll serve` for local development
4. Use `./scripts/lint-check.sh` before committing
5. Run tests with `npm test` to ensure quality
