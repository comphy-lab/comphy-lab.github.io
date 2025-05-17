#!/bin/bash

# Exit on error
set -e

# Define color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print script banner
function print_banner() {
  echo -e "${BLUE}=============================================${NC}"
  echo -e "${BLUE}     CoMPhy Lab Website Linting Script      ${NC}"
  echo -e "${BLUE}=============================================${NC}"
  echo
}

# Print usage instructions
function print_usage() {
  echo -e "Usage: $0 [OPTIONS]"
  echo
  echo -e "Options:"
  echo -e "  --js     Run JavaScript linting only"
  echo -e "  --css    Run CSS linting only"
  echo -e "  --md     Run Markdown linting only"
  echo -e "  --fix    Try to automatically fix issues"
  echo -e "  --help   Show this help message"
  echo
  echo -e "Without options, all linters will be run."
  echo
}

# Check if Node.js and npm are installed
function check_node() {
  echo -e "${BLUE}Checking Node.js and npm...${NC}"
  
  if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed.${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
  fi
  
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed.${NC}"
    echo -e "${YELLOW}npm should be installed with Node.js. Please check your installation.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✓ Node.js $(node -v) and npm $(npm -v) found.${NC}"
  echo
}

# Check if dependencies are installed
function check_dependencies() {
  echo -e "${BLUE}Checking dependencies...${NC}"
  
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Dependencies not found. Installing...${NC}"
    npm install --quiet
    echo -e "${GREEN}✓ Dependencies installed.${NC}"
  else
    echo -e "${GREEN}✓ Dependencies found.${NC}"
    
    # Check if package.json has changed since dependencies were installed
    if [ "package.json" -nt "node_modules/.package-lock.json" ]; then
      echo -e "${YELLOW}package.json has been modified. Updating dependencies...${NC}"
      npm install --quiet
      echo -e "${GREEN}✓ Dependencies updated.${NC}"
    fi
  fi
  
  # Initialize husky if it's not already
  if [ ! -d ".husky/_" ]; then
    echo -e "${YELLOW}Initializing husky git hooks...${NC}"
    npx husky install
    echo -e "${GREEN}✓ Husky initialized.${NC}"
  fi
  
  echo
}

# Run JavaScript linting
function lint_js() {
  if [ "$FIX_MODE" = true ]; then
    echo -e "${BLUE}Linting and fixing JavaScript files...${NC}"
    npm run lint:js -- --fix
  else
    echo -e "${BLUE}Linting JavaScript files...${NC}"
    npm run lint:js
  fi
  echo -e "${GREEN}✓ JavaScript linting complete.${NC}"
  echo
}

# Run CSS linting
function lint_css() {
  if [ "$FIX_MODE" = true ]; then
    echo -e "${BLUE}Linting and fixing CSS files...${NC}"
    npm run lint:css -- --fix
  else
    echo -e "${BLUE}Linting CSS files...${NC}"
    npm run lint:css
  fi
  echo -e "${GREEN}✓ CSS linting complete.${NC}"
  echo
}

# Run Markdown linting
function lint_md() {
  echo -e "${BLUE}Linting Markdown files...${NC}"
  npm run lint:md
  if [ "$FIX_MODE" = true ]; then
    echo -e "${YELLOW}Note: Markdown linting doesn't support auto-fixing via command line.${NC}"
  fi
  echo -e "${GREEN}✓ Markdown linting complete.${NC}"
  echo
}

# Run all linters
function lint_all() {
  lint_js
  lint_css
  lint_md
}

# Main execution
print_banner

# Initialize variables
RUN_JS=false
RUN_CSS=false
RUN_MD=false
FIX_MODE=false

# Process command line arguments
if [ $# -eq 0 ]; then
  RUN_ALL=true
else
  RUN_ALL=false
  for arg in "$@"
  do
    case $arg in
      --js)
        RUN_JS=true
        ;;
      --css)
        RUN_CSS=true
        ;;
      --md)
        RUN_MD=true
        ;;
      --fix)
        FIX_MODE=true
        ;;
      --help)
        print_usage
        exit 0
        ;;
      *)
        echo -e "${RED}Unknown option: $arg${NC}"
        print_usage
        exit 1
        ;;
    esac
  done
fi

# Check for Node.js and npm
check_node

# Check and install dependencies
check_dependencies

# Run linters based on arguments
if [ "$RUN_ALL" = true ]; then
  echo -e "${BLUE}Running all linters...${NC}"
  lint_all
else
  if [ "$RUN_JS" = true ]; then
    lint_js
  fi
  
  if [ "$RUN_CSS" = true ]; then
    lint_css
  fi
  
  if [ "$RUN_MD" = true ]; then
    lint_md
  fi
  
  # If no specific linter was chosen but --fix was specified, run all with fix
  if [ "$RUN_JS" = false ] && [ "$RUN_CSS" = false ] && [ "$RUN_MD" = false ]; then
    echo -e "${BLUE}Running all linters...${NC}"
    lint_all
  fi
fi

echo -e "${GREEN}All linting tasks completed!${NC}"