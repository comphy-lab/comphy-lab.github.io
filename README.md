# CoMPhy Lab Website

This repository contains the source code for the CoMPhy Lab website. The website is built using Jekyll, a static site generator, and is hosted on GitHub Pages.

## Repository Structure and Description

```
COMPHY-LAB.GITHUB.IO/
├── _config.yml                 # Main Jekyll configuration file
├── _includes/                  # Reusable HTML components and partials
├── _layouts/                   # Page layout templates
│   └── default.html           # Default layout template for pages
├── _research/                 # Collection of research and publication entries
├── _site/                     # Generated site (not tracked in git)
├── _team/                     # Collection of team member profiles
├── assets/                    # Static assets
│   ├── css/                  # Stylesheets
│   │   ├── vendor.css       # Third-party and reset styles
│   │   └── styles.css       # Main site styles with glass-morphism effects
│   ├── js/                  # JavaScript files
│   │   ├── plugins.js       # Third-party plugins
│   │   └── main.js         # Main site functionality and markdown rendering
│   └── logos/                # Lab logos and branding assets
├── featured/                  # Featured content and images
├── about.md                   # About section content in markdown
├── Gemfile                    # Ruby gem dependencies
├── Gemfile.lock              # Locked versions of gem dependencies
├── index.html                # Website homepage
├── LICENSE
├── README.md
├── .gitignore
└── .ruby-version             # Ruby version specification
```

## Key Components

### Configuration and Build Files
- `_config.yml`: Defines site-wide settings, collections configuration, and Jekyll build options
- `Gemfile` & `Gemfile.lock`: Specify Ruby dependencies including Jekyll and its plugins
- `.ruby-version`: Specifies the required Ruby version for the project

### Content Management
- `about.md`: Contains the About section content in markdown format, automatically rendered on the website
- `_research/`: Contains research projects, areas, and publications
- `_team/`: Houses team member profiles and information
- `_includes/`: Contains reusable HTML components for consistent layout
- `_layouts/`: Contains page templates, with `default.html` as the main layout

### Assets and Static Files
- `assets/`: 
  - `css/`:
    - `vendor.css`: Reset and third-party styles
    - `styles.css`: Main site styles including:
      - Glass-morphism effects
      - Responsive design
      - Custom scrollbars
      - Grid layouts
      - Animations
  - `js/`:
    - `plugins.js`: Third-party plugins and utilities
    - `main.js`: Site functionality including:
      - Markdown rendering
      - Social media integration
      - Smooth scrolling
      - Mobile menu handling
  - `logos/`: Lab branding assets and logos
- `featured/`: Featured content, images, and highlighted materials

## Content Management

### Adding Team Members
1. Create a new entry in the `_team/index.md` file
2. Follow this format for each team member:
   ```markdown
   ## Member Name
   ![Member Photo](/path/to/photo.jpg)
   - Current Position, Institution / **status** year
   - Previous Position, Institution / year-year
   - Education Degree, Institution / year-year
   
   Research Interest: Brief description of research interests
   ```
3. Key formatting notes:
   - Use `##` for member name (H2 heading)
   - Place image immediately after name
   - Use bullet points for positions and education
   - Use `**text**` for emphasis (e.g., **starting**, **current**)
   - Keep image dimensions 400x400 pixels for consistency
   - Add CV button by linking: `[Download CV](/path/to/cv.pdf)`

### Updating About Section
1. Edit the `about.md` file using markdown syntax
2. Content will automatically be rendered on the website
3. Supports all standard markdown features:
   - Headers (H1-H6)
   - Lists (ordered and unordered)
   - Links
   - Code blocks
   - Emphasis and strong text

### Social Media Integration
- Bluesky feed integration in the About section:
  - Fixed-height container (1050px)
  - Custom scrollbar
  - Branded header with logo
  - Load-more functionality
- Blog link to Obsidian published notes
- Dynamic content loading and rendering

### Main Pages
- `index.html`: The main landing page featuring:
  - Animated header with gradient text
  - Split-layout About section:
    - Left: Markdown content
    - Right: Bluesky feed in scrollable container
  - Responsive navigation with glass-morphism effects
  - Fixed-position header with blur effect

### Research Papers (`_research/index.md`)
The research section is organized chronologically with the following structure:

1. **Section Organization**:
   - "Work in Progress": Papers that have received positive reviews but not yet published
   - Years in reverse chronological order (e.g., 2025, 2024, etc.)

2. **Paper Entry Format**:
   ```markdown
   * Author1, A., **Author2, B.**, & Author3, C. (YEAR). Title of the paper. _Journal Abbrev._, VOL, PAGE.

       [![BadgeType](https://img.shields.io/static/v1.svg?style=flat-square&label=LABEL&message=MESSAGE&color=COLOR)](URL)
   ```

3. **Formatting Rules**:
   - Use `**Bold**` for Vatsal Sanjay's name
   - Italicize journal names with underscores: `_J. Fluid Mech._`
   - Standard journal abbreviations: 
     - _J. Fluid Mech._ for Journal of Fluid Mechanics
     - _Phys. Rev. Lett._ for Physical Review Letters
     - _Nat. Commun._ for Nature Communications
     - _Sci. Adv._ for Science Advances
     - _AIChE J._ for AIChE Journal
     - _Chem. Eng. Sci._ for Chemical Engineering Science
     - _Build. Simul._ for Building Simulation
     - _Phys. Fluids_ for Physics of Fluids

4. **Badge Styles**:
   - Use `flat-square` style for all badges
   - Color codes:
     - `green`: arXiv preprints
     - `orange`: DOI/Journal links
     - `blue`: Additional information
   - Common badge types:
     - arXiv: `[![arXiv](https://img.shields.io/static/v1.svg?style=flat-square&label=arXiv&message=ID&color=green)]`
     - JFM: `[![JFM](https://img.shields.io/static/v1.svg?style=flat-square&label=JFM&message=Open%20Access&color=orange)]`
     - DOI: `[![DOI](https://img.shields.io/static/v1.svg?style=flat-square&label=DOI&message=DOI_NUMBER&color=orange)]`
     - PDF: `[![PDF](https://img.shields.io/static/v1.svg?style=flat-square&label=PDF&message=Available&color=green)]`
     - GitHub: `[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)]`

5. **Paper Status Annotations**:
   - For papers under review: "Received positive reviews in _Journal_"
   - For accepted papers: "_Journal_ (in press)"
   - For published papers: Include volume and page numbers

6. **Spacing**:
   - One blank line between sections
   - One blank line between papers
   - Two spaces indentation for badges
   - No extra spacing between multiple badges

## Local Development

To run this website locally for development and testing, follow these steps:

1. **Prerequisites**
   - Install Ruby (version 2.5.0 or higher)
   - Install Bundler
   ```bash
   gem install bundler
   ```

2. **Install Dependencies**
   ```bash
   bundle install
   ```

3. **Run Local Server**
   ```bash
   bundle exec jekyll serve
   ```
   This will start a local server at `http://localhost:4000`

4. **View the Website**
   - Open your web browser
   - Navigate to `http://localhost:4000`
   - Changes to source files (including about.md) will automatically trigger a rebuild

## Notes
- The website will automatically rebuild when changes are pushed to the main branch
- Local testing is recommended before pushing changes
- Markdown content is rendered client-side for better performance
- Social media feeds are loaded asynchronously
- Glass-morphism effects require modern browser support
