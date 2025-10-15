#!/bin/bash

# deploy.sh - Find an available port and start Jekyll development server
# Usage: ./scripts/deploy.sh

set -e

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
START_PORT=4001
END_PORT=4999
LIVERELOAD_START_PORT=35730
LIVERELOAD_END_PORT=35999

# Function to check if a port is available
is_port_available() {
    local port=$1
    # Check if port is in use using lsof
    if lsof -i :$port >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Function to find an available port
find_available_port() {
    echo -e "${BLUE}🔍 Searching for available port...${NC}" >&2

    for port in $(seq $START_PORT $END_PORT); do
        if is_port_available $port; then
            echo -e "${GREEN}✓ Found available port: ${port}${NC}" >&2
            echo $port
            return 0
        fi
    done

    echo -e "${RED}✗ No available ports found in range ${START_PORT}-${END_PORT}${NC}" >&2
    return 1
}

# Function to find an available livereload port
find_available_livereload_port() {
    echo -e "${BLUE}🔍 Searching for available livereload port...${NC}" >&2

    for port in $(seq $LIVERELOAD_START_PORT $LIVERELOAD_END_PORT); do
        if is_port_available $port; then
            echo -e "${GREEN}✓ Found available livereload port: ${port}${NC}" >&2
            echo $port
            return 0
        fi
    done

    echo -e "${RED}✗ No available livereload ports found in range ${LIVERELOAD_START_PORT}-${LIVERELOAD_END_PORT}${NC}" >&2
    return 1
}

# Main execution
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Jekyll Development Server${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Find an available port
PORT=$(find_available_port)

if [ -z "$PORT" ]; then
    echo -e "${RED}Failed to find an available port. Exiting.${NC}"
    exit 1
fi

# Find an available livereload port
LIVERELOAD_PORT=$(find_available_livereload_port)

if [ -z "$LIVERELOAD_PORT" ]; then
    echo -e "${RED}Failed to find an available livereload port. Exiting.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Starting Jekyll server on port ${PORT}...${NC}"
echo -e "${GREEN}🔄 Live reload enabled on port ${LIVERELOAD_PORT}${NC}"
echo -e "${YELLOW}📍 Local URL: http://localhost:${PORT}${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop the server${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Start Jekyll with the found ports
bundle exec jekyll serve --port $PORT --livereload --livereload-port $LIVERELOAD_PORT
