# CoMPhy Lab Website

# CoMPhy Lab Website

The official website for the Computational Multiphase Physics Laboratory, built with Jekyll.

## Directory Structure

```
.
├── _config.yml              # Site configuration
├── _includes               # Reusable components
├── _layouts                # Page templates
│   ├── default.html       # Base layout
│   ├── research.html      # Research page layout
│   └── team.html          # Team page layout
├── _research              # Research project content
├── _team                  # Team member profiles
├── assets                 # Static files
│   ├── css               # Stylesheets
│   ├── favicon           # Site favicon
│   ├── images            # Image files
│   ├── js                # JavaScript files
│   └── logos             # Logo files
├── about.md               # About page content
├── index.html             # Homepage
├── Gemfile               # Ruby dependencies
└── _site                 # Generated site (not tracked in git)
```

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



## Key Components

### Configuration and Build Files
- `_config.yml`: Defines site-wide settings, collections configuration, and Jekyll build options
- `Gemfile` & `Gemfile.lock`: Specify Ruby dependencies including Jekyll and its plugins
- `.ruby-version`: Specifies the required Ruby version for the project
- `CNAME`: Configures custom domain for GitHub Pages

### Layout Templates
- `_layouts/default.html`: Base template that defines the common structure
- `_layouts/research.html`: Template for research pages
- `_layouts/team.html`: Template for team member pages

### Content Management
- `about.md`: Contains the About section content in markdown format
- `_research/`: Contains research projects, areas, and publications
- `_team/`: Contains team member profiles and information
- `featured/`: Houses featured content and highlighted material
- `scripts/`: Contains utility scripts for site maintenance

### Assets
- `assets/css/`: Stylesheet files for site styling
- `assets/js/`: JavaScript files for site functionality
- `assets/images/`: Image assets including team photos
- `assets/logos/`: Lab branding and logo files
- `assets/favicon/`: Website favicon assets

### Icon Usage
Team member profiles support various icon links:
1. **GitHub**: Using Font Awesome 6.5.2
   ```markdown
   [<i class="fa-brands fa-github" style="font-size: 1.5em; color: black;"></i>](https://github.com/username)
   ```
2. **Google Scholar**: Using Academicons
   ```markdown
   [<i class="ai ai-google-scholar-square" style="font-size: 1.5em;"></i>](https://scholar.google.com/citations?user=USER_ID)
   ```

These icons are loaded through CSS dependencies in the layout files:
```html
<!-- Font dependencies -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link rel="stylesheet" href="/assets/css/fontello/css/fontello.css">
<link rel="stylesheet" href="/assets/css/academicons-1.7.0/css/academicons.min.css">
```

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

### Adding New Team Members

To add a new team member, follow these steps:

1. Add member information to `_team/index.md`:
   - Use `##` for member name (H2 heading)
   - Add social links using Font Awesome/Academic icons:
     ```markdown
     [<i class="fab fa-github" style="font-size: 2.5em; color: black;"></i>](https://github.com/username)
     [<i class="ai ai-google-scholar-square" style="font-size: 2.5em;"></i>](https://scholar.google.com/citations?user=...)
     ```
   - Add member photo:
     ```markdown
     <img src="../assets/images/team/X.webp" alt="Member Name" loading="lazy" width="250" height="250" class="member-image">
     ```
     where X is the next available number in sequence

2. Add member photo:
   - Save photo as webp format in `assets/images/team/`
   - Name it as the next number in sequence (e.g., if last photo is 7.webp, name new photo 8.webp)
   - Recommended photo size: 250x250 pixels
   - Use professional headshot with clear background
   - Photos will automatically get:
     - A loading wave animation while the image loads
     - Proper scaling and object-fit behavior
     - Mobile-responsive sizing (200x200px on smaller screens)
     - Automatic centering relative to member name
     - Responsive layout with centered text alignment on mobile

3. If jointly supervised, add the joint supervisor info:
   ```markdown
   Joint with [Supervisor Name](link_to_supervisor)
   ```

4. Add education/position history using bullet points:
   ```markdown
   - [Current Position, Institution / Year](link_to_profile)
   - [Previous Position, Institution / Year](link_to_profile_or_thesis)
   ```

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
  - Lab name with expanded acronym: "Computational Multiphase Physics (CoMPhy) Lab"
  - Social media links with color scheme matching the lab name:
    - ORCID (matte red)
    - GitHub (purple)
    - Google Scholar (blue)
  - Responsive navigation with glass-morphism effects
  - Fixed-position header with blur effect and warm orange tint
  - Animated header with gradient text
  - Split-layout About section:
    - Left: Markdown content
    - Right: Bluesky feed in scrollable container

### Design Elements
- **Color Scheme**:
  - Text gradient: Red to blue for the lab name
  - Social icons: Matte red (ORCID), Purple (GitHub), Blue (Google Scholar)
  - Header background: Transparent warm orange with blur effect
- **Typography**:
  - Clean, modern fonts for readability
  - Gradient effects for emphasis
- **Layout**:
  - Responsive design for all screen sizes
  - Glass-morphism effects for modern look
  - Fixed header with blur effect

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
   - For papers under review with no reviews: "Submitted to _Journal_"
   - For papers under review with positive reviews: "Received positive reviews in _Journal_"
   - For accepted papers: "_Journal_ (in press)"
   - For published papers: Include volume and page numbers

6. **Spacing**:
   - One blank line between sections
   - One blank line between papers
   - Two spaces indentation for badges
   - No extra spacing between multiple badges


## Fonts and Icons Attribution

This website uses several fonts and icon sets that are freely available under open-source licenses:

### Icon Sets
- **Academicons 1.7.0**: Used for academic icons (Google Scholar, etc.)
  - Font License: SIL OFL 1.1
  - CSS License: MIT License
  - Source: https://github.com/jpswalsh/academicons
- **Font Awesome**: Used for general icons (GitHub, etc.)
  - License: MIT License
- **Fontello**: Custom icon set
  - License: Various open-source licenses depending on included icons

### Fonts
- **Libre Baskerville**: SIL Open Font License
- **Open Sans**: Apache License 2.0

We extend our sincere thanks to the creators and maintainers of these fonts and icon sets for making their work freely available to the academic community.

## Notes
- The website will automatically rebuild when changes are pushed to the main branch
- Local testing is recommended before pushing changes
- Markdown content is rendered client-side for better performance
- Social media feeds are loaded asynchronously
- Glass-morphism effects require modern browser support
