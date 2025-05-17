# CoMPhy Lab Website

[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fcomphy-lab.github.io&style=flat-square&logo=github&label=Website)](https://comphy-lab.org)
[![Pages Build](https://img.shields.io/github/actions/workflow/status/comphy-lab/comphy-lab.github.io/pages/pages-build-deployment?style=flat-square&logo=github&label=Pages)](https://github.com/comphy-lab/comphy-lab.github.io/actions/workflows/pages/pages-build-deployment)
[![Issues](https://img.shields.io/github/issues/comphy-lab/comphy-lab.github.io?style=flat-square&logo=github)](https://github.com/comphy-lab/comphy-lab.github.io/issues)
[![PRs](https://img.shields.io/github/issues-pr/comphy-lab/comphy-lab.github.io?style=flat-square&logo=github)](https://github.com/comphy-lab/comphy-lab.github.io/pulls)
[![License](https://img.shields.io/github/license/comphy-lab/comphy-lab.github.io?style=flat-square)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/comphy-lab/comphy-lab.github.io?style=flat-square&logo=github)](https://github.com/comphy-lab/comphy-lab.github.io/commits/main)
[![Jekyll](https://img.shields.io/badge/Jekyll-4.3.2-%23CC0000?style=flat-square&logo=jekyll)](https://jekyllrb.com/)

A static website for the Computational Multiphase Physics Laboratory, built with Jekyll and designed for hosting on GitHub Pages.

## Directory Structure

```
.
├── _config.yml                # Site-wide configuration
├── _includes                  # Reusable components
├── _layouts                   # Page templates
│   ├── default.html           # Base layout
│   ├── research.html          # Research page layout
│   ├── teaching.html          # Teaching page layout (for main teaching page with course listing)
│   ├── teaching-course.html   # Individual course page layout (without sorting functionality)
│   └── team.html              # Team page layout
├── _research                  # Research project and publication entries
├── _team                      # Team member profiles
├── _teaching                  # Teaching course entries and pages
│   ├── index.md               # Teaching landing page
│   └── 2025-Basilisk101-Madrid.md # Course page
├── assets                     # Static files (images, css, js, logos, favicon)
│   ├── css                    # Stylesheets
│   │   ├── main.css          # Main stylesheet
│   │   ├── research.css      # Research page styles with dark mode support
│   │   ├── teaching.css      # Teaching page styles with dark mode support
│   │   ├── team.css          # Team page styles with dark mode support
│   │   ├── styles.css        # Global styles with light/dark theme variables (optimized)
│   │   └── command-palette.css # Command palette styles (⌘K)
│   ├── js                    # JavaScript files
│   │   ├── main.js          # Main JavaScript
│   │   ├── command-data.js  # Command palette data and functionality
│   │   ├── platform-utils.js # Platform detection and UI utilities
│   │   ├── shortcut-key.js  # Keyboard shortcut handling
│   │   └── search_db.json   # Generated search database (used by command palette)
│   ├── favicon              # Favicon files
│   └── img                  # Image assets
│       └── teaching         # Teaching images
├── scripts                    # Build and utility scripts
│   ├── build.sh              # Main build script
│   └── generate_search_db.rb  # Search database generator
├── .github                    # GitHub specific files
│   ├── ISSUE_TEMPLATE        # Issue templates
│   └── PULL_REQUEST_TEMPLATE # PR templates
├── aboutCoMPhy.md              # About page content (markdown)
├── News.md                     # Lab news and announcements (markdown)
├── contact.html               # Contact page that redirects to Join Us page
├── join.html                  # Join Us page (opportunities)
├── index.html                 # Homepage
├── Gemfile                    # Ruby dependencies
└── _site                      # Generated site (ignored by Git)
    └── search_db.json        # Generated search database
```

## Part A: Front-End Documentation

### Local Development

1. **Prerequisites**
   - Ruby (version 3.2.0 or higher)
   - Bundler (`gem install bundler`)

2. **Install Dependencies**
   ```bash
   bundle install
   ```

3. **Build and Run**
   ```bash
   # Build the site and search database
   ./scripts/build.sh

   # Run local server
   bundle exec jekyll serve
   ```
   - Visit http://localhost:4000 in the browser
   - Changes require rebuilding with `./scripts/build.sh`

4. **Deployment**
   - Typically managed via GitHub Pages when merged/pushed to the main branch
   - Local testing is recommended before committing changes
   - Cloudflare cache is automatically purged on deployment via GitHub Actions
     - Requires `CLOUDFLARE_ZONE_ID` and `CLOUDFLARE_API_TOKEN` secrets in repository settings

### Content Management

#### About Page
- `aboutCoMPhy.md`: Contains the About section in markdown
- Standard markdown elements (headers, lists, links) are supported
- Edits automatically appear once the site is rebuilt

#### News Page
- `News.md`: Contains the lab's news and announcements in markdown
- News items are displayed on the homepage in the right sidebar
- Format each news item with a date and brief description
- The news content is loaded dynamically using JavaScript

#### Contact Page Redirect
- `contact.html`: Automatically redirects users to the Join Us page
- Uses JavaScript's `window.location.replace()` for a seamless redirect
- Includes fallback content in case JavaScript is disabled
- URL structure: `/contact/` redirects to `/join`

#### Adding or Editing Team Members
1. Open the `_team/index.md` file
2. Follow this basic format for each member:
   ```markdown
   ## Member Name
   ![Photo](/path/to/photo.jpg)
   - Current Position, Institution / **status** year
   - Previous Position, Institution / year-year
   - Education Degree, Institution / year-year

   Research Interest: Brief description
   ```

3. For social links:
   ```markdown
   [<i class="fab fa-github" style="font-size: 2.5em;"></i>](https://github.com/username)
   [<i class="ai ai-google-scholar-square" style="font-size: 2.5em;"></i>](https://scholar.google.com/citations?user=USER_ID)
   ```

4. Member Photo:
   ```html
   <img src="../assets/images/team/8.webp" alt="Member Name" width="250" height="250" class="member-image">
   ```

#### Research Papers
1. Each paper should be added to `_research/index.md` in the following format:

```markdown
<h3 id="NUMBER">[NUMBER] Author1, A., **Author2, B.**, & Author3, C. Title. _Journal_, Volume, Pages (Year).</h3>

<tags><span>Tag1</span><span>Tag2</span><span>Featured</span></tags>

[![Badge1](https://img.shields.io/static/v1.svg?style=flat-square&label=LABEL&message=MESSAGE&color=COLOR)](URL)
[![Badge2](https://img.shields.io/static/v1.svg?style=flat-square&label=LABEL&message=MESSAGE&color=COLOR)](URL)

<iframe width="560" height="315" src="YOUTUBE_EMBED_URL" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
```

2. Important elements:
   - `id="NUMBER"`: Unique ID for direct linking (e.g., `/research/#12`)
   - `[NUMBER]`: Paper number in square brackets
   - Author names: Use `<strong>` for lab members
   - Journal names: Use italics with underscores
   - Tags: Include relevant topic tags
   - Badges: Use shields.io style badges for links
   - Videos: Use YouTube embed code with privacy-enhanced mode

3. Featured Papers:
   - Add `<span>Featured</span>` to the tags to display the paper on the main page
   - Maximum 2 papers can be featured at any time
   - Featured papers will automatically appear in the featured section of the homepage

4. Available Tags:
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

5. Common Badge Types:
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
<tags><span>Tag1</span><span>Tag2</span></tags>
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
   - Theme toggle button in the header of all layouts (default, team, research, teaching, teaching-course)
   - CSS variables for theme colors in `styles.css` and page-specific stylesheets
   - JavaScript to handle theme switching and user preferences

3. **Customizing Theme Colors**
   - Light and dark theme variables are defined in `assets/css/styles.css`
   - Page-specific theme colors in respective CSS files (research.css, teaching.css, team.css)
   - Theme is applied using the `data-theme` attribute on the HTML element

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

The website uses three GitHub Actions workflows for automation:

1. **Jekyll site CI** (`.github/workflows/jekyll.yml`)
   - Builds and deploys the Jekyll website
   - Triggers on push/PR to main branch
   - Two-step process:
     1. Builds site and generates artifacts
     2. Deploys to GitHub Pages
   - Uses latest Ruby and Jekyll versions

2. **pages-build-deployment** (GitHub-managed)
   - Built-in GitHub Pages deployment workflow
   - Handles final deployment to GitHub's servers
   - Works automatically with Jekyll CI workflow
   - Provides deployment status and URLs

3. **Update Search Database** (`.github/workflows/update-search.yml`)
   - Maintains site's search functionality
   - Triggers:
     - Daily at 4:00 UTC automatically
     - On content file changes (MD/HTML)
     - Manual trigger available
   - Fetches the search database from [comphy-lab/comphy-search](https://github.com/comphy-lab/comphy-search)
   - Updates `search_db.json` in the website repository
   - Commits changes back to repository

These workflows work together to ensure:
- Automated site builds and deployments
- Up-to-date search functionality
- Consistent deployment to GitHub Pages

3. **Blog Content Indexing**
   - Blog content from [blogs.comphy-lab.org](https://blogs.comphy-lab.org) is indexed in the [comphy-search](https://github.com/comphy-lab/comphy-search) repository
   - Source: [comphy-lab/CoMPhy-Lab-Blogs](https://github.com/comphy-lab/CoMPhy-Lab-Blogs)
   - Filtering criteria:
     - Only indexes markdown files where `publish: false` is NOT set in frontmatter
     - Automatically excludes any files with "todo" in the filename (case-insensitive)
   - The search index is automatically updated:
     - Daily via GitHub Actions
     - When changes are pushed to markdown or HTML files
     - Can be manually triggered from the Actions tab
   - This approach improves search quality by:
     - Centralizing search database generation
     - Accessing the raw markdown directly from the source
     - Respecting publish status in frontmatter
     - Processing content in a more structured way
     - Avoiding web scraping issues or rate limits

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

### CSS Architecture

The website's CSS has been optimized for better performance and maintainability:

1. **Variable System**
   - Color variables for both light and dark themes
   - Typography variables for consistent font sizing
   - Spacing variables for layout consistency
   - Shadow and transition presets for unified effects

2. **Consolidated Media Queries**
   - Queries organized by breakpoint rather than by component
   - Shared breakpoints at 1700px, 1300px, 1200px, 900px, 768px, and 500px
   - Mobile-first approach throughout

3. **Optimized Dark Theme Support**
   - CSS variables for seamless theme switching
   - Fallback values for older browsers
   - Theme-specific accent colors and contrasts
   - Consistent text and background colors across components

4. **Performance Improvements**
   - Reduced redundant selectors
   - Consolidated duplicate styles
   - Optimized transitions and animations
   - Simplified box shadows for better rendering