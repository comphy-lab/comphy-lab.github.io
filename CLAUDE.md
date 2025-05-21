# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains the CoMPhy Lab website, a static site built with Jekyll for the Computational Multiphase Physics Laboratory. The site features research publications, team member information, teaching materials, and lab news.

## Build and Development Commands

- **Install dependencies:**

  ```bash
  bundle install && cd scripts && npm install && cd ..
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

## Deployment Process

- Site is automatically deployed via GitHub Pages when changes are merged to main
- GitHub Actions workflows trigger the build and deployment process
- Cloudflare cache is purged automatically on deployment
