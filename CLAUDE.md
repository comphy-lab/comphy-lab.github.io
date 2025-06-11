# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains the CoMPhy Lab website, a static site built with Jekyll for the Computational Multiphase Physics Laboratory. The site features research publications, team member information, teaching materials, and lab news.

## Key Architecture Patterns

### Command Palette and Search System

The website implements a sophisticated command palette system that requires coordination between multiple files:

- **`command-palette.js`** must load before **`command-data.js`** (dependency order)
- **Fuse.js** powers fuzzy search functionality
- Search database (`search_db.json`) is maintained in a separate repository and updated via GitHub Actions
- Context-aware commands based on current page location
- Keyboard shortcut: ⌘K (Mac) / Ctrl+K (Windows)

### Theme System Architecture

- CSS variables defined in `:root` for light theme, overridden in `[data-theme="dark"]`
- Theme state persisted in localStorage and synced across all pages
- Page-specific theme variables in `research.css`, `teaching.css`, `team.css`
- Smooth transitions between themes using CSS transitions

### Research Tag Filtering

- Client-side JavaScript filtering with SEO-friendly static pages
- Pre-generated tag pages that redirect to filtered views
- Multiple URL variations for better SEO coverage
- Tags must be added to `_research/index.md` using `<tags><span>TagName</span></tags>` format

## Essential Commands

```bash
# Initial setup (installs Ruby/Node.js if needed)
./scripts/setup.sh

# Build site with all assets
./scripts/build.sh

# Local development server
bundle exec jekyll serve

# Run before committing
./scripts/lint-check.sh

# Run a single test
npm test -- command-data.test.js

# Run tests with coverage
npm test -- --coverage

# Fix common issues
./scripts/fix-script-order.sh    # Fix script loading order
./scripts/fix-js-line-length.sh  # Enforce 80 char limit
./scripts/fix-quotes.sh          # Standardize to double quotes
```

## Content Management

### Adding Research Papers

Add to `_research/index.md` with this exact format:

```markdown
<h3 id="NUMBER">[NUMBER] Author1, A., **Author2, B.**, & Author3, C. Title. _Journal_, Volume, Pages (Year).</h3>

<tags><span>Tag1</span><span>Tag2</span><span>Featured</span></tags>

[![Badge](https://img.shields.io/static/v1.svg?style=flat-square&label=LABEL&message=MESSAGE&color=COLOR)](URL)
```

- Use `**Name**` for lab members
- Add `<span>Featured</span>` tag to display on homepage (max 2)
- ID attribute enables direct linking: `/research/#NUMBER`

### Team Member Format

In `_team/index.md`:

```html
<img src="../assets/images/team/NUMBER.webp" alt="Name" width="250" height="250" class="member-image">
```

### Teaching Course Pages

- Main page: `_teaching/index.md` (uses `teaching` layout)
- Course pages: `_teaching/YYYY-CourseName-Location.md` (uses `teaching-course` layout)
- Images: Store in `/assets/images/teaching/` (600x400px for cards, 1200x400px for banners)

## Critical Implementation Details

### Script Dependencies

The lint-check.sh script automatically fixes these, but be aware:

- Fuse.js must load before any search functionality
- command-palette.js must load before command-data.js
- Theme initialization must happen early in page load

### Pre-commit Hooks

Automatically installed via setup.sh using Husky:

- ESLint with auto-fix for JavaScript
- Prettier for formatting
- markdownlint for Markdown files
- Only staged files are checked
- Bypass with `git commit --no-verify` in emergencies

### Search Database Updates

- Maintained in [comphy-lab/comphy-search](https://github.com/comphy-lab/comphy-search) repository
- Updated daily via GitHub Actions
- Includes blog content from blogs.comphy-lab.org
- Manual trigger available in Actions tab

### CSS Variable System

Key variables for customization:

```css
/* Colors */
--primary-color, --secondary-color, --accent-color
--text-color, --bg-color, --card-bg
/* Typography */
--font-family-serif, --font-family-sans
/* Spacing */
--spacing-unit, --content-max-width
/* Shadows & Transitions */
--shadow-sm, --shadow-md, --transition-speed
```

## Testing Strategy

### Test Coverage Areas

- Command palette functionality (navigation, search, keyboard shortcuts)
- Line breaking utilities (80-character enforcement)
- Platform detection (Mac vs Windows shortcuts)
- Teaching page sorting algorithms
- Browser API mocks in `setup.js`

### Running Specific Tests

```bash
# Test command palette
npm test -- command-data.test.js

# Test with watch mode for development
npm test -- --watch

# Quick validation without Jest
node scripts/simple-test.js
```

## Performance Considerations

### Build Process

The build.sh script performs these operations in sequence:

1. Jekyll build with production environment
2. Search database generation (if in GitHub Actions)
3. SEO tag generation
4. Filtered research page creation

### Asset Optimization

- Images should be optimized before adding
- Use WebP format where possible
- Lazy loading implemented for images
- CSS consolidated by breakpoint for better caching

## Important Conventions

### File Management

- ALWAYS prefer editing existing files over creating new ones
- Developer documentation (README.md, CONTRIBUTING.md, etc.) should NEVER be created unless explicitly requested
- Site content markdown files (research papers, news items, teaching pages) follow their specific workflows:
  - Research: Add to `_research/index.md` following the documented format
  - News: Use `/add-news` command or edit `News.md` and `history.md`
  - Teaching: Create course pages in `_teaching/` directory when adding new courses
- Follow existing patterns in the codebase

### Code Style

- 80-character line limit for JavaScript
- Double quotes for strings
- ES6+ features (arrow functions, const/let, async/await)
- Mobile-first CSS with min-width media queries
- BEM naming for CSS classes

### Git Workflow

- Work on feature branches
- Run `./scripts/lint-check.sh` before committing
- Ensure tests pass with `npm test`
- Reference issue numbers in commits

## Custom Slash Commands

### /add-news

Adds a news item to both News.md and history.md while maintaining the 5-item limit on the main page.

**Workflow:**

1. Add the news item to the appropriate month/year section in both files
2. If month/year doesn't exist, create it
3. Keep only 5 most recent news items in News.md (excluding the pinned Durham announcement)
4. Preserve the pinned item (recognized by not having ### Month header above it)

**Usage:**

```bash
/add-news "Your news content here"
```

**Implementation steps:**

1. Read both News.md and history.md
2. Ask for month/year if not provided or unclear
3. Add to history.md in the correct chronological position
4. Add to News.md in the correct position
5. Count non-pinned news items in News.md
6. If count > 5, remove oldest items from News.md only
7. Save both files

**Important notes:**

- The pinned Durham announcement has no month/year header
- News items start with "- " (dash and space)
- Maintain blank lines between sections for proper formatting
- In history.md, years are sorted descending (newest first)
- Within a year, months appear in chronological order
