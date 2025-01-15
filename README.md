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
```markdown
### Author1, A., **Author2, B.**, & Author3, C. Title. _J. Fluid Mech._, 999, 1-20.

<tags><span>Bubbles</span><span>Jets</span></tags>

[![arXiv](https://img.shields.io/static/v1.svg?style=flat-square&label=arXiv&message=ID&color=green)](LINK)
[![DOI](https://img.shields.io/static/v1.svg?style=flat-square&label=DOI&message=NUMBER&color=orange)](URL)
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

### Fonts and Icons Attribution
- Academicons 1.7.0 (SIL OFL 1.1, MIT)
- Font Awesome (MIT)
- Fontello (Various licenses)
- Libre Baskerville (SIL Open Font License)
- Open Sans (Apache License 2.0)