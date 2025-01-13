# CoMPhy Lab Website

This repository contains the source code for the CoMPhy Lab website. The website is built using Jekyll, a static site generator, and is hosted on GitHub Pages.

## Repository Structure and Description

```
COMPHY-LAB.GITHUB.IO/
├── _config.yml                 # Main Jekyll configuration file
├── _includes/                  # Reusable HTML components and partials
├── _layouts/                   # Page layout templates
│   └── default.html           # Default layout template for pages
├── _publications/             # Collection of publication entries
├── _research/                 # Collection of research project entries
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
- `_publications/`: Stores publication entries that are displayed on the website
- `_research/`: Contains information about research projects and areas
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

## Content Management

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
- Bluesky feed is embedded in the About section
- Fixed height container with scrollable content
- Branded header with Bluesky logo
- Updates automatically when new posts are made
- Configurable number of posts and load-more functionality

## Notes
- The website will automatically rebuild when changes are pushed to the main branch
- Local testing is recommended before pushing changes
- Markdown content is rendered client-side for better performance
- Social media feeds are loaded asynchronously
- Glass-morphism effects require modern browser support
