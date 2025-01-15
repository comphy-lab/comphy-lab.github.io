# CoMPhy Lab Website

A static website for the Computational Multiphase Physics Laboratory, built with Jekyll and designed for hosting on GitHub Pages.

## Directory Structure

```
.
├── _config.yml                # Site-wide configuration
├── _includes                  # Reusable components
├── _layouts                   # Page templates
│   ├── default.html           # Base layout
│   ├── research.html          # Research page layout
│   └── team.html             # Team page layout
├── _research                  # Research project and publication entries
├── _team                      # Team member profiles
├── assets                     # Static files (images, css, js, logos, favicon)
├── about.md                   # About page content (markdown)
├── index.html                 # Homepage
├── Gemfile                    # Ruby dependencies
└── _site                      # Generated site (ignored by Git)
```

## Part A: Front-End Documentation

### Local Development

1. **Prerequisites**
   - Ruby (version 2.5.0 or higher)
   - Bundler (`gem install bundler`)

2. **Install Dependencies**
   ```bash
   bundle install
   ```

3. **Run Local Server**
   ```bash
   bundle exec jekyll serve
   ```
   - Visit http://localhost:4000 in the browser
   - Changes in source files trigger automatic rebuilds

4. **Deployment**
   - Typically managed via GitHub Pages when merged/pushed to the main branch
   - Local testing is recommended before committing changes

### Content Management

#### About Page
- `about.md`: Contains the About section in markdown
- Standard markdown elements (headers, lists, links) are supported
- Edits automatically appear once the site is rebuilt

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
   [![Blog](https://img.shields.io/badge/Blog-Coming%20Soon-yellow?style=flat-square&logo=obsidian&logoColor=white)](URL)
   ```

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
- Academicons 1.7.0 (SIL OFL 1.1, MIT)
- Font Awesome (MIT)
- Fontello (Various licenses)
- Libre Baskerville (SIL Open Font License)
- Open Sans (Apache License 2.0)