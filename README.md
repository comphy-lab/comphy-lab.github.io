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
│   ├── teaching.html          # Teaching page layout
│   └── team.html              # Team page layout
├── _research                  # Research project and publication entries
├── _team                      # Team member profiles
├── _teaching                  # Teaching course entries and pages
│   ├── index.md               # Teaching landing page
│   └── 2025-Basilisk101-Madrid.md # Course page
├── assets                     # Static files (images, css, js, logos, favicon)
│   ├── css                    # Stylesheets
│   │   ├── main.css          # Main stylesheet
│   │   ├── research.css      # Research page styles
│   │   ├── teaching.css      # Teaching page styles
│   │   ├── team.css          # Team page styles
│   │   └── search.css        # Search functionality styles
│   ├── js                    # JavaScript files
│   │   ├── main.js          # Main JavaScript
│   │   ├── search.js        # Search functionality
│   │   └── search_db.json   # Generated search database
│   ├── favicon              # Favicon files
│   └── img                  # Image assets
│       └── teaching         # Teaching images
├── scripts                    # Build and utility scripts
│   ├── build.sh              # Main build script
│   └── generate_search_db.rb  # Search database generator
├── .github                    # GitHub specific files
│   ├── ISSUE_TEMPLATE        # Issue templates
│   └── PULL_REQUEST_TEMPLATE # PR templates
├── about.md                   # About page content (markdown)
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
- `about.md`: Contains the About section in markdown
- Standard markdown elements (headers, lists, links) are supported
- Edits automatically appear once the site is rebuilt

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
   - Dissipative anamoly
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
   - Uses the teaching layout

2. **Individual Course Pages**
   - Located in `_teaching/` directory (e.g., `_teaching/2025-Basilisk101-Madrid.md`)
   - Use the teaching layout
   - Follow this basic format:
   
   ```markdown
   ---
   layout: teaching
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

Search results are prioritized and filtered as follows:
1. Team Members (highest priority)
   - Direct matches in names
   - Research interests and affiliations
   - Social media links and profile information
2. Research Papers
   - Titles and authors
   - Tags and categories
3. Blog Posts from blogs.comphy-lab.org
4. Regular content (headings and paragraphs)

Search behavior and restrictions:
- Minimum query length: 2 characters
- Shows only top 5 most relevant results
- Requires at least 50% of query words to match
- Prioritizes matches near the start of content
- Properly renders markdown and HTML in results

The search database is automatically generated during the build process by `scripts/generate_search_db.rb`. This script:
- Indexes all HTML and markdown content
- Identifies and prioritizes team members and research papers
- Extracts tags from research papers
- Fetches and indexes blog posts from blogs.comphy-lab.org
- Generates a JSON database used by the search functionality

### External Blog Integration
The search functionality includes content from our external blog at blogs.comphy-lab.org:
- Blog posts are fetched and indexed during build
- Each post's title and content are searchable
- Results link directly to the blog post
- Blog content is refreshed with each build

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

### Design Elements
- **Color Scheme**
  - Gradient text (Red to Blue) for lab name
  - Warm orange tint + blur for header
- **Typography**
  - Libre Baskerville, Open Sans
  - Gradients for emphasis
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
     - Every 4 hours automatically
     - On content file changes (MD/HTML)
     - Manual trigger available
   - Generates and updates `search_db.json`
   - Commits changes back to repository

These workflows work together to ensure:
- Automated site builds and deployments
- Up-to-date search functionality
- Consistent deployment to GitHub Pages

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