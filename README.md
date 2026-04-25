# CoMPhy Lab Website

[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fcomphy-lab.github.io&style=flat-square&logo=github&label=Website)](https://comphy-lab.org)
[![Pages Build](https://img.shields.io/github/actions/workflow/status/comphy-lab/comphy-lab.github.io/pages/pages-build-deployment?style=flat-square&logo=github&label=Pages)](https://github.com/comphy-lab/comphy-lab.github.io/actions/workflows/pages/pages-build-deployment)
[![Issues](https://img.shields.io/github/issues/comphy-lab/comphy-lab.github.io?style=flat-square&logo=github)](https://github.com/comphy-lab/comphy-lab.github.io/issues)
[![PRs](https://img.shields.io/github/issues-pr/comphy-lab/comphy-lab.github.io?style=flat-square&logo=github)](https://github.com/comphy-lab/comphy-lab.github.io/pulls)
[![License](https://img.shields.io/github/license/comphy-lab/comphy-lab.github.io?style=flat-square)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/comphy-lab/comphy-lab.github.io?style=flat-square&logo=github)](https://github.com/comphy-lab/comphy-lab.github.io/commits/main)
[![Jekyll](https://img.shields.io/badge/Jekyll-4.3.2-%23CC0000?style=flat-square&logo=jekyll)](https://jekyllrb.com/)
[![Tests](https://img.shields.io/badge/Tests-Jest-green?style=flat-square&logo=jest)](https://jestjs.io/)

A static website for the Computational Multiphase Physics Laboratory, built with Jekyll and designed for hosting on GitHub Pages.

## Directory Structure

```bash
.
├── _config.yml                 # Site-wide configuration
├── _data                       # YAML data sources for data-driven pages
│   ├── hero.yml                #   homepage hero (slides, copy)
│   ├── news.yml                #   news feed (homepage + /news/ archive)
│   ├── team.yml                #   team page (present, collaborators, alumni)
│   └── research_themes.yml     #   research themes block
├── _includes                   # Reusable Jekyll fragments
│   ├── footer-v2.html          #   site footer (v2)
│   ├── theme-init.html         #   early theme persistence (avoids FOUC)
│   ├── tokens-bridge.html      #   v2 token wiring
│   └── tokens-head.html        #   <head> token primer
├── _layouts                    # Page templates
│   ├── default.html            #   base layout used by most pages
│   ├── research.html           #   research collection layout
│   ├── teaching.html           #   teaching landing layout (sortable)
│   ├── teaching-course.html    #   individual course layout
│   ├── team.html               #   team page layout
│   ├── join-us.html            #   join page layout
│   └── history.html            #   news history layout
├── _research                   # Research project and publication entries
├── _team                       # Team page (renders from _data/team.yml)
├── _teaching                   # Teaching course entries and pages
├── _join-us                    # Join Us page entries
├── assets                      # Static files (images, css, js, logos, favicon)
│   ├── css                     # Stylesheets
│   │   ├── tokens.css          #   v2 design tokens (single source of truth)
│   │   ├── bridge.css          #   maps legacy --color-* names to v2 tokens,
│   │   │                       #   declares shared component primitives
│   │   ├── styles.css          #   legacy global stylesheet
│   │   ├── home.css            #   homepage v2 styles
│   │   ├── team-v2.css         #   team page v2 styles
│   │   ├── research-v2.css     #   research page v2 styles
│   │   ├── footer-v2.css       #   footer v2 styles
│   │   ├── about-layout.css    #   about-layout styles
│   │   ├── join-us.css         #   join page styles
│   │   ├── shared-news-history.css # news + history shared styles
│   │   ├── research.css        #   legacy research page styles
│   │   ├── team.css            #   legacy team page styles
│   │   ├── teaching.css        #   teaching page styles
│   │   ├── command-palette.css #   ⌘K command palette
│   │   └── vendor.css          #   third-party CSS bundle
│   ├── js                      # JavaScript files
│   │   ├── main.js             #   main JS (preloader, news loader, etc.)
│   │   ├── command-data.js     #   command palette data + behaviour
│   │   ├── platform-utils.js   #   platform detection / UI utilities
│   │   ├── shortcut-key.js     #   keyboard shortcut handling
│   │   └── search_db.json      #   generated search index
│   ├── favicon                 # Favicon files
│   ├── images                  # Image assets (team, teaching, covers, …)
│   └── logos                   # Brand logos
├── scripts                     # Build and utility scripts (see "Scripts Documentation")
├── tests                       # Jest unit tests
├── .github                     # CI workflows, issue/PR templates
├── about.html                  # /about/ — JS redirect to /
├── contact.html                # /contact/ — JS redirect to /join
├── join.html                   # /join/ — Join Us page
├── index.html                  # /  — Homepage
├── News.md                     # /news/ feed legacy bullet list
├── history.md                  # /history/ — full news archive
├── Gemfile                     # Ruby dependencies
└── _site                       # Generated site (ignored by Git)
```

## Part A: Front-End Documentation

### Local Development

1. **Quick Setup (Recommended)**

   For both fresh machines and existing development environments:

   ```bash
   ./scripts/setup.sh
   ```

   This script will:
   - Check for Ruby/Node.js and install them if missing (via rbenv/nvm)
   - Install the repo-pinned Bundler version from `Gemfile.lock`
   - Run a Ruby/Bundler preflight before installing dependencies
   - Install all Ruby gems and npm packages
   - Build the site and generate search database
   - Install Git hooks for pre-commit checks (via Husky)
   - Run validation tests

2. **Manual Setup (Alternative)**

   Prerequisites:
   - Ruby `3.2.2` (matches `.ruby-version`)
   - Bundler `2.5.23` (`gem install bundler -v 2.5.23`)
   - Node.js and npm (for linting and testing)

   Install Dependencies:

   ```bash
   # Ruby/Bundler preflight
   bash scripts/check-ruby-toolchain.sh

   # Ruby dependencies
   bundle _2.5.23_ install
   
   # JavaScript dependencies
   npm install
   ```

3. **Build and Run**

   **Quick Start (Recommended):**

   ```bash
   # Automatically finds available port and starts Jekyll with live reload
   ./scripts/deploy.sh
   ```

   This script will:
   - Find an available port (4001-4999) to avoid conflicts
   - Start Jekyll development server with live reload
   - Display the local URL (e.g., <http://localhost:4001>)
   - Auto-refresh browser on file changes

   **Manual Build (Alternative):**

   ```bash
   # Build the site and search database
   ./scripts/build.sh

   # Run local server
   bundle exec jekyll serve
   ```

   - Visit <http://localhost:4000> in the browser
   - Changes require rebuilding with `./scripts/build.sh`

4. **Testing**

   ```bash
   # Run all tests
   npm test
   
   # Run tests with code coverage
   npm test -- --coverage
   
   # Run simple tests without Jest
   node scripts/simple-test.js
   
   # Run tests via wrapper script
   ./scripts/runTests.sh
   ```

5. **Code Quality and Maintenance**

   ```bash
   # Run all linters and auto-fix issues
   ./scripts/lint-check.sh
   
   # Fix JavaScript line length issues (80 chars max)
   ./scripts/fix-js-line-length.sh
   
   # Convert single quotes to double quotes in JS files
   ./scripts/fix-quotes.sh
   
   # Fix script loading order (command-palette.js before command-data.js)
   ./scripts/fix-script-order.sh
   ```

6. **Deployment**
   - Typically managed via GitHub Pages when merged/pushed to the main branch
   - Local testing is recommended before committing changes
   - Cloudflare cache is automatically purged on deployment via GitHub Actions
     - Requires `CLOUDFLARE_ZONE_ID` and `CLOUDFLARE_API_TOKEN` secrets in repository settings

### Content Management

The homepage hero, news feed, team page, and research themes are
**data-driven** from YAML files in `_data/`. Edit the data file rather
than hand-writing HTML.

#### Homepage hero

`_data/hero.yml` drives the hero section (slides, eyebrow, copy, video
poster). Add or reorder slides there; layout adapts automatically.

#### News (`_data/news.yml`, News.md, history.md)

- `_data/news.yml`: source of truth for the homepage feed and `/news/`
  archive. Each item has `date`, `kind` (`paper` | `talk` | `people` |
  `move` | `award`), `title`, `meta`, `action_label`, `action_href`.
- `News.md`: legacy short-form list, kept to **5 most recent** items
  plus the pinned Durham announcement.
- `history.md`: full archive, never trimmed.
- Years descend in `history.md`; months descend within each year. Pinned
  items have no month/year header.
- Use the `/add-news` slash command (in agent-driven workflows) or
  manually edit all three files together.

#### Redirect pages

- `about.html` (Jekyll permalink `/about/`): redirects to `/` via JS
  with a visible fallback link.
- `contact.html` (Jekyll permalink `/contact/`): redirects to `/join`.
- Both mirror the same redirect pattern; keep them aligned if you change
  one.

#### Adding or Editing Team Members

The team page renders from `_data/team.yml` — three sections (`present`,
`collaborators`, `alumni`), each with `name`, `role`, `photo`, `bio`,
optional links. Photo files go under `assets/images/team/` (1:1 crop,
used at `--r-md` radius). Bio is line-clamped per section (3 lines
present, 4 collaborators, unset alumni).

```yaml
present:
  - name: Member Name
    role: Current position, Institution
    photo: /assets/images/team/N.webp
    bio: Brief research interest summary.
    links:
      - { kind: github,  href: "https://github.com/username" }
      - { kind: scholar, href: "https://scholar.google.com/citations?user=ID" }
```

#### Research Papers

1. Each paper should be added to `_research/index.md` in the following format:

```markdown
<h3 id="NUMBER">[NUMBER] Author1, A., **Author2, B.**, & Author3, C. Title. _Journal_, Volume, Pages (Year).</h3>

<div class="tags"><span>Tag1</span><span>Tag2</span><span>Featured</span></div>

[![Badge1](https://img.shields.io/static/v1.svg?style=flat-square&label=LABEL&message=MESSAGE&color=COLOR)](URL)
[![Badge2](https://img.shields.io/static/v1.svg?style=flat-square&label=LABEL&message=MESSAGE&color=COLOR)](URL)

<iframe width="560" height="315" src="YOUTUBE_EMBED_URL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
```

1. Important elements:
   - `id="NUMBER"`: Unique ID for direct linking (e.g., `/research/#12`)
   - `[NUMBER]`: Paper number in square brackets
   - Author names: Use `<strong>` for lab members
   - Journal names: Use italics with underscores
   - Tags: Include relevant topic tags
   - Badges: Use shields.io style badges for links
   - Videos: Use YouTube embed code with privacy-enhanced mode

2. Featured Papers:
   - Add `<span>Featured</span>` to the tags to display the paper on the main page
   - Maximum 2 papers can be featured at any time
   - Featured papers will automatically appear in the featured section of the homepage

3. Available Tags:
   - Bubbles
   - Drops
   - Jets
   - Sheets
   - Non-Newtonian
   - Coalescence
   - Superamphiphobic-surfaces
   - Impact forces
   - Dissipative anomaly
   - Soft-matter-singularities
   - Featured
   - (Add new tags as needed)

4. Common Badge Types:

   ```markdown
   [![arXiv](https://img.shields.io/static/v1.svg?style=flat-square&label=arXiv&message=ID&color=green)](URL)
   [![DOI](https://img.shields.io/static/v1.svg?style=flat-square&label=DOI&message=NUMBER&color=orange)](URL)
   [![JFM](https://img.shields.io/static/v1.svg?style=flat-square&label=JFM&message=Open%20Access&color=orange)](URL)
   [![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](URL)
   [![Blog](https://img.shields.io/badge/Blog-blogs.comphy--lab.org-blue?style=flat-square&logo=obsidian&logoColor=white)](https://blogs.comphy-lab.org)
   ```

#### Teaching Content

1. **Main Teaching Page**
   - Located at `_teaching/index.md`
   - Lists all available courses
   - Uses the `teaching` layout with sorting functionality

2. **Individual Course Pages**
   - Located in `_teaching/` directory (e.g., `_teaching/2025-Basilisk101-Madrid.md`)
   - Use the `teaching-course` layout (optimized for single course display without sorting functionality)
   - Follow this basic format:

   ```markdown
   ---
   layout: teaching-course
   title: "Course Title"
   permalink: /teaching/course-permalink
   ---
   
   <div class="course-image">
     <img src="/path/to/banner-image.jpg" alt="Course Title" loading="lazy">
   </div>
   
   # Course Title
   
   <div class="course-details">
     <div class="course-details__item">
       <h4><i class="fa-solid fa-calendar-days"></i> Dates</h4>
       <p>Date range</p>
     </div>
     <div class="course-details__item">
       <h4><i class="fa-solid fa-location-dot"></i> Location</h4>
       <p>Location information</p>
     </div>
   </div>
   
   ## Course content...
   ```

3. **Course Images**
   - Store in `/assets/images/teaching/` directory
   - Card images (600x400px): Used on the main teaching page
   - Banner images (1200x400px): Used on individual course pages
   - Follow naming convention: `[course-name]-[location].[extension]`

### Search Functionality

The website includes a powerful search feature that allows users to:

- Search through all content including titles, text, and tags
- Get instant search results with highlighted matching text
- See match percentage for each result
- Navigate directly to specific sections using anchor links
- Access search via keyboard shortcut (⌘K on Mac, ctrl+K on Windows) or by clicking the magnifying glass icon in the navigation

Search results are prioritized and filtered as follows:

1. Team Members (highest priority)
   - Direct matches in names
   - Research interests and affiliations
   - Social media links and profile information
2. Teaching Content
   - Course titles and descriptions
   - Course details (dates, locations, prerequisites)
   - Course schedules and topics
3. Research Papers
   - Titles and authors
   - Tags and categories
4. Blog Posts from [blogs.comphy-lab.org](https://blogs.comphy-lab.org)
   - Indexed directly from the GitHub repository (comphy-lab/CoMPhy-Lab-Blogs)
   - Only indexes markdown files where the publish flag is not set to false
   - Excludes todo markdown files (case-insensitive)
   - Updated automatically every 12 hours via GitHub Actions
5. Regular content (headings and paragraphs)

The search database is maintained in a separate repository [comphy-lab/comphy-search](https://github.com/comphy-lab/comphy-search) and is automatically updated in this website via GitHub Actions. This approach:

- Centralizes search database generation in a dedicated repository
- Ensures consistent search functionality across the website
- Automatically updates the search database daily or when content changes
- Simplifies maintenance by separating search logic from the website code

#### Search Result Prioritization

Search results are prioritized using a two-step process:

1. **Priority Field**: Each entry in the search database has a priority field (1-5, with 1 being highest priority)
   - Priority 1: Team members
   - Priority 2: Featured papers and teaching content
   - Priority 3: Regular papers and blog posts
   - Priority 4-5: Other content

2. **Relevance Scoring**: Within each priority level, results are further ranked by relevance using:
   - Title matches (70% weight)
   - Content matches (20% weight)
   - Tag and category matches (10% weight)

This ensures that higher-priority content (like team members) always appears before lower-priority content, even if the lower-priority content has a better text match.

### Command Palette Functionality

The website includes a command palette feature that provides quick access to actions and navigation through keyboard shortcuts:

- **Keyboard Shortcut**: Access via ⌘K on Mac, ctrl+K on Windows, or by clicking the terminal icon in the navigation
- **Navigation Commands**: Quickly navigate to any section of the website
- **External Link Commands**: Direct access to GitHub, Google Scholar, YouTube, and Bluesky
- **Tool Commands**: Scroll to top/bottom and other utility functions
- **Context-Aware Commands**: Additional commands appear based on current page
- **Search Integration**: Search is available separately via the ⌘K shortcut
- **Keyboard Navigation**: Use arrow keys to navigate through commands, Enter to select, and Esc to close

Key features:

- Custom implementation with vanilla JavaScript for better control and performance
- Different visual styling from search to avoid confusion (indigo accent color vs blue for search)
- Grouping of commands by section for easy discoverability
- Shortcuts for common tasks (g h = go home, g r = go to research, etc.)
- Full keyboard navigation with arrow keys, Enter, and Escape
- Footer with keyboard shortcut hints for better usability

The command palette is built with:

- Custom vanilla JavaScript implementation
- Responsive and accessible design
- Integration with the site search database for content discovery
- Complete keyboard navigation support

Files:

- `/assets/js/command-data.js`: Defines all available commands and search database integration
- `/assets/css/command-palette.css`: Styling for the command palette

Search behavior and features:

- Minimum query length: 3 characters
- Keyboard shortcut (⌘K / ctrl+K) opens a command palette style search interface on all pages
- Magnifying glass icon in navigation opens the search interface when clicked
- Search input in navigation shows the full "⌘K (search)" text by default
- Custom command palette implementation provides a modern command palette experience
- Search results appear instantly as you type
- Results are ranked by relevance and match percentage

### External Blog Integration

The search functionality includes content from our external blog at blogs.comphy-lab.org:

- Blog posts are fetched and indexed in the comphy-search repository
- Each post's title and content are searchable
- Results link directly to the blog post
- Blog content is refreshed with each update to the search database

### Tags System

Research papers can be tagged with multiple topics. Tags are defined in the markdown files using the following format:

```html
<div class="tags"><span>Tag1</span><span>Tag2</span></div>
```

These tags are:

- Displayed with each paper
- Searchable through the search interface
- Used for filtering papers by topic
- Included in search match percentage calculations

## Part B: Back-End Documentation

### Configuration and Layouts

- `_config.yml`: Site-wide settings, collections, build options
- Layout Templates in `_layouts/`
- Partial Includes in `_includes/`
- Assets in `assets/`

### Theme Toggle

The website supports both light and dark themes with an easy toggle switch in the header navigation:

1. **Theme Preferences**
   - Automatically detects user's system preference (light/dark mode)
   - Remembers user's manual selection using localStorage
   - Maintains theme consistency across page navigation

2. **Implementation Details**
   - Theme toggle button in the header of all layouts (default, team,
     research, teaching, teaching-course, join-us, history)
   - Brand colours and theme variables live in `assets/css/tokens.css`
     (single source of truth for the v2 design system)
   - `bridge.css` maps legacy `--color-*` names onto the v2 tokens, so
     legacy stylesheets continue to work
   - Early theme persistence via `_includes/theme-init.html` to avoid FOUC

3. **Customizing Theme Colors**
   - Brand and theme tokens: `assets/css/tokens.css`
   - Legacy variable bridge (kept for compatibility): `assets/css/bridge.css`
   - Legacy globals: `assets/css/styles.css`; legacy page styles in
     `research.css`, `teaching.css`, `team.css`
   - v2 page styles: `home.css`, `team-v2.css`, `research-v2.css`,
     `footer-v2.css`
   - Theme is applied via the `data-theme` attribute on the HTML element

### Design Elements

- **Color Scheme**
  - Gradient text (Red to Blue) for lab name
  - Warm orange tint + blur for header
  - Dark theme support with adjusted colors for better night viewing
- **Theme Toggle**
  - Located in the header next to the Google Scholar icon
  - Switches between light (default) and dark themes
  - Uses SVG icons (moon/sun) with smooth transitions
  - Persists user preference via localStorage
  - Falls back to system preference when no user selection exists
- **Typography**
  - Libre Baskerville, Open Sans
  - Gradients for emphasis
  - White text in dark theme for improved readability
- **Favicon**
  - Located in `/assets/favicon/`
  - Multiple sizes for different devices and browsers
  - Generated from CoMPhy Lab logo

### Fonts and Icons Attribution

- [Academicons 1.7.0 (SIL OFL 1.1, MIT)](https://jpswalsh.github.io/academicons/)
- [Font Awesome](https://fontawesome.com/)
- Fontello (Various licenses)
- Libre Baskerville (SIL Open Font License)
- Open Sans (Apache License 2.0)

### GitHub Actions Workflows

| Workflow | Purpose |
| --- | --- |
| `jekyll.yml` | Builds and deploys the Jekyll site to GitHub Pages on push/PR to `main`. |
| `pages-build-deployment` (GitHub-managed) | Final deploy to GitHub's edge. |
| `update-search.yml` | Pulls the search index from [comphy-lab/comphy-search](https://github.com/comphy-lab/comphy-search) daily at 04:00 UTC and on content changes. |
| `rebuild-on-search-update.yml` | Re-runs the build when the search index changes. |
| `content-rules-checks.yml` | Runs `validate-content-rules.sh` and the trigger-parity check. |
| `maintenance-regression-checks.yml` | Regression suite for housekeeping scripts (deploy, validators). |
| `teaching-content-checks.yml` | markdownlint + Prettier gate for `_teaching/` pages. |
| `pr-hygiene-check.yml` | PR hygiene — blocks mixed dependency/security PRs. |
| `cloudflare-purge.yml` | Purges Cloudflare cache after deploy (needs `CLOUDFLARE_ZONE_ID` and `CLOUDFLARE_API_TOKEN` secrets). |
| `sync-org-profile-publications.yml` | Syncs publications to the org profile README. |
| `weekly-tests.yml` | Scheduled weekly smoke tests. |

Together these ensure the site builds, the search index stays fresh,
and content invariants hold across PRs.

#### Blog content indexing

Blog content from [blogs.comphy-lab.org](https://blogs.comphy-lab.org) is
indexed in the
[comphy-search](https://github.com/comphy-lab/comphy-search) repository,
sourced from
[comphy-lab/CoMPhy-Lab-Blogs](https://github.com/comphy-lab/CoMPhy-Lab-Blogs).

Filtering rules:

- Only indexes markdown files where `publish: false` is **not** set in
  frontmatter.
- Excludes any file with "todo" in the filename (case-insensitive).

Index refresh:

- Daily via GitHub Actions.
- On pushes that change markdown/HTML.
- Manually via the Actions tab.

The split-repo approach centralises search generation, reads raw
markdown from source, respects `publish:` flags, and avoids web-scraping
rate limits.

## Scripts Documentation

The `scripts/` directory contains various utility scripts for development, testing, and maintenance:

### Core Scripts

- **`setup.sh`** - Complete environment setup for both fresh and existing installations
  - Installs Ruby via rbenv and Node.js via nvm if not present
  - Installs the repo-pinned Bundler version and runs a Ruby/Bundler preflight
  - Installs all dependencies (Ruby gems and npm packages)
  - Builds the site and runs validation tests
  - Handles version conflicts gracefully

- **`build.sh`** - Main build script
  - Builds the Jekyll site
  - Generates the search database
  - Updates SEO tags
  - Creates filtered research pages by tags

- **`deploy.sh`** - Local development server with smart port detection
  - Automatically finds available ports (4001-4999)
  - Starts Jekyll development server with live reload
  - Handles port conflicts gracefully
  - Auto-refreshes browser on file changes

- **`lint-check.sh`** - Code quality and formatting
  - Runs all linters (ESLint, Stylelint, markdownlint)
  - Auto-fixes issues when possible
  - Ensures code consistency across the project

- **`check-ruby-toolchain.sh`** - Ruby/Bundler preflight
  - Verifies Ruby version matches `.ruby-version`
  - Verifies the repo-pinned Bundler is available
  - Used by `setup.sh`; also runnable on its own when chasing
    "wrong Ruby" install errors

- **`validate-content-rules.sh`** - Content invariants
  - Checks `history.md` chronological ordering
  - Checks `_research/index.md` tag-markup format
  - Checks `CLAUDE.md` and `README.md` don't reintroduce the
    deprecated bare `tags` element (replaced by `div.tags` blocks)
  - Run by the `content-rules` CI workflow

- **`check-content-rules-trigger-parity.py`** - Workflow guard
  - Ensures the file paths that trigger the `content-rules` workflow
    match the validated-file set, so the validator never silently
    skips a file by mistake

### Utility Scripts

- **`fix-js-line-length.sh`** - JavaScript line length fixer
  - Ensures JavaScript files don't exceed 80 characters per line
  - Automatically wraps long lines while preserving functionality
  - Uses the Node.js script `fix-line-length.js`

- **`fix-quotes.sh`** - Quote standardization
  - Converts single quotes to double quotes in JavaScript files
  - Platform-aware (handles macOS/Linux sed differences)
  - Processes all JS files in `assets/js/`

- **`fix-script-order.sh`** - Script dependency ordering
  - Ensures `command-palette.js` loads before `command-data.js`
  - Scans HTML files in `_layouts/` and `_includes/`
  - Automatically reorders script tags when needed

### Ruby Scripts

- **`generate_seo_tags.rb`** - SEO optimization
  - Generates meta tags for better search engine visibility
  - Creates Open Graph and Twitter Card metadata
  - Processes all research papers and pages

- **`generate_filtered_research.rb`** - Research filtering
  - Creates tag-based filtered pages for research papers
  - Generates individual pages for each research tag
  - Updates navigation and search functionality

### Python Scripts

- **`sync_org_profile_publications.py`** - Org profile sync
  - Pulls the publications block from `_research/index.md` into the
    GitHub org profile README (kept in `_org_profile/`)
  - Run periodically; not part of the regular build

### Test Scripts

- **`simple-test.js`** - Lightweight test runner
  - Runs basic tests without external dependencies
  - Validates project structure and file existence
  - Checks build outputs and syntax
  - Provides colored terminal output

- **`runTests.sh`** - Test wrapper
  - Simple wrapper for `npm test`
  - Returns appropriate exit codes for CI/CD
  - Displays success/failure messages

### Node.js Scripts

- **`fix-line-length.js`** - Line breaking utility
  - Core logic for breaking long JavaScript lines
  - Handles strings, comments, and code intelligently
  - Preserves code functionality while improving readability

## Testing

This project uses Jest for unit testing JavaScript functionality with comprehensive coverage:

### Test Coverage

- **fix-line-length.js** - Line breaking utilities and string processing
- **command-data.js** - Command palette functionality and search integration
- **platform-utils.js** - Platform detection and UI utilities
- **shortcut-key.js** - Keyboard shortcut handling
- **teaching.js** - Teaching page course sorting and filtering
- **setup.js** - Browser environment mocks and test setup

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with code coverage
npm test -- --coverage

# Run tests in watch mode (re-runs on file changes)
npm test -- --watch

# Run a specific test file
npm test -- command-data.test.js

# Run simple validation tests (no dependencies)
node scripts/simple-test.js
```

### Test Structure

- Tests are located in the `/tests` directory
- Test files follow the naming pattern: `[module-name].test.js`
- Browser environment is mocked in `setup.js` for DOM-dependent code
- Tests use Jest's built-in assertions and mocking capabilities
- Coverage reports are generated in the `/coverage` directory

### Test Categories

1. **Unit Tests** - Test individual functions and modules
2. **Integration Tests** - Test component interactions
3. **Validation Tests** - Check file structure and build outputs
4. **Mock Tests** - Verify browser API mocks work correctly

### Writing Tests

1. Create a new test file in the `/tests` directory
2. Import the module or function to test:

   ```javascript
   const { functionName } = require("../path/to/module");
   ```

3. Structure tests using `describe` and `it` blocks:

   ```javascript
   describe("Module Name", () => {
     it("should do something specific", () => {
       expect(functionName(input)).toBe(expectedOutput);
     });
   });
   ```

4. Run tests to ensure they pass
5. Check coverage with `npm test -- --coverage`

### Coverage Goals

- Maintain at least 80% code coverage
- Focus on critical path testing
- Mock external dependencies appropriately
- Test edge cases and error handling

## Contributing

### Issue Templates

The repository includes several issue templates to streamline the process of reporting problems or requesting changes:

1. [🐛 Report a Bug](../../issues/new?template=bug_report.yml&labels=bug&title=%5BBug%5D%3A+): Use this template to report website issues or malfunctions
2. [👤 Add Team Member](../../issues/new?template=add_team_member.yml&labels=team,content&title=%5BTeam%5D%3A+Add+): Template for requesting addition of new team members
3. [📄 Add Publication](../../issues/new?template=add_publication.yml&labels=publication,content&title=%5BPublication%5D%3A+Add+): Template for adding new research publications
4. [✨ Suggest Enhancement](../../issues/new?template=enhancement.yml&labels=enhancement&title=%5BEnhancement%5D%3A+): For suggesting improvements or new features

To create a new issue:

1. Click on one of the links above to use a template directly
2. Or go to the Issues tab and click "New Issue"
3. Choose the appropriate template
4. Fill in the required information
5. Submit the issue

### Pull Request Template

When submitting changes, use the provided PR template which includes:

- Description of changes
- Type of change (bug fix, feature, content update, etc.)
- Testing checklist
- Related issues
- Screenshots (if applicable)

To submit a PR:

1. Fork the repository
2. Make your changes in a new branch
3. Test changes locally
4. Create a PR using the template
5. Link any related issues
6. Wait for review

### Code Style

#### General

- Use 2-space indentation across all files
- Follow DRY principles: reuse components, variables, and styles
- Add comments for complex logic, but keep code self-documenting

#### HTML/Markdown

- Use semantic HTML elements
- Follow BEM naming convention for CSS classes (e.g., `s-header__nav-list`)
- Keep content files in markdown format where possible

#### CSS

- Use CSS variables for colors and typography (defined in `:root`)
- Use responsive breakpoints at 1700px, 1300px, 900px, 768px, 500px
- Use `rem` units for font sizes and spacing
- Follow mobile-first approach for media queries
- Leverage CSS custom properties for theme switching
- Organize media queries by breakpoint for better maintainability
- Use standardized variable naming for consistent styling

#### JavaScript

- Use ES6+ features (arrow functions, const/let, template literals)
- Always include 'use strict' mode
- Use async/await for asynchronous operations
- Implement error handling with try/catch blocks
- Use camelCase for variable and function names
- Prefer event delegation for multiple similar elements

#### Images

- Optimize images for web (compress to reduce file size)
- Follow naming convention: `[name]-[descriptor].[extension]`
- Include alt text for all images

### Linting and Code Formatting

The repository uses automated tools to ensure code quality and consistency:

#### Setup

1. Install dependencies (automatically includes pre-commit hooks):

   ```bash
   ./scripts/setup.sh
   ```

   Or manually:

   ```bash
   npm install
   npx husky install
   ```

#### Pre-commit Hooks

This repository uses Husky and lint-staged to automatically check and format code before commits:

- **JavaScript files**: ESLint (with auto-fix) + Prettier
- **CSS files**: Prettier formatting
- **Markdown files**: markdownlint-cli2
- **JSON/YAML files**: Prettier formatting

When you commit, these checks run automatically on staged files only. If any issues are found that can't be auto-fixed, the commit will be blocked.

#### Linters

- **JavaScript**: ESLint with recommended rules
  - Run manually: `npm run lint:js`
- **CSS**: Stylelint with standard configuration
  - Run manually: `npm run lint:css`
- **Markdown**: markdownlint-cli2 for consistent documentation
  - Run manually: `npm run lint:md`
- **Code Formatting**: Prettier
  - Run manually: `npm run format`
- **Tests**: Jest
  - Run manually: `npm test`

#### How Pre-commit Works

1. Stage your changes: `git add .`
2. Commit: `git commit -m "your message"`
3. Pre-commit hooks automatically:
   - Run ESLint on JavaScript files (auto-fixes when possible)
   - Format all files with Prettier
   - Check Markdown files with markdownlint
   - If all checks pass, the commit proceeds
   - If any check fails, the commit is blocked with error details

#### Skip Hooks

If needed, hooks can be bypassed with:

```bash
git commit --no-verify
```

### CSS Architecture

The site is mid-migration to a "v2" design system. New work composes from
the v2 layer; legacy styles remain so older pages keep rendering.

1. **Design tokens (`assets/css/tokens.css`)**
   - Single source of truth for the v2 layer
   - Brand colours (`--c-brand-*`, `--c-accent-*`)
   - Typography (`--t-*`), spacing (`--s-*`), radii (`--r-*`)
   - Light theme by default; dark overrides under `[data-theme="dark"]`

2. **Bridge layer (`assets/css/bridge.css`)**
   - Loaded **after** `tokens.css` and `styles.css` so its `:root`
     declarations win the cascade
   - Maps legacy `--color-*` / `--font-*` / `--shadow-*` names onto v2
     tokens — legacy pages pick up the new palette without rewrites
   - Declares shared component primitives reused across v2 pages
     (panel, eyebrow, lede, chip, btn-ghost, paper-card, news-row,
     team-tile, `.visually-hidden`)

3. **v2 page stylesheets**
   - `home.css`, `team-v2.css`, `research-v2.css`, `footer-v2.css`,
     `about-layout.css`, `shared-news-history.css`, `join-us.css`
   - Compose from bridge primitives; only add page-specific rules

4. **Legacy stylesheets**
   - `styles.css`, `research.css`, `team.css`, `teaching.css`
   - Kept for pages not yet migrated; bridged into the v2 token system

5. **Consolidated media queries**
   - Breakpoints: 1700, 1300, 1200, 900, 768, 500 (mobile-first)
   - Organised by breakpoint for cache-friendly delivery
