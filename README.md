# CoMPhy Lab Website

This repository contains the source code for the CoMPhy Lab website. The website is built using Jekyll, a static site generator, and is hosted on GitHub Pages.

## Repository Structure

The repository follows the standard Jekyll website structure:
- `_posts/`: Contains blog posts and news updates
- `_layouts/`: Contains the templates for different page layouts
- `_includes/`: Contains reusable components
- `assets/`: Contains static files like images, CSS, and JavaScript
- `_config.yml`: Main configuration file for the Jekyll site

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
   - Changes to the source files will automatically trigger a rebuild

## Making Changes

1. Make your desired changes to the website content or structure
2. Test your changes locally using the steps above
3. Once satisfied, commit your changes and push to GitHub

## Notes
- The website will automatically rebuild when changes are pushed to the main branch
- Local testing is recommended before pushing changes to ensure everything works as expected
