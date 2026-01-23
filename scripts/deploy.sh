#!/bin/bash

# deploy.sh - Find an available port and start Jekyll development server
# Usage: ./scripts/deploy.sh [OPTIONS]

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

# Default options
ENABLE_LIVERELOAD=true
ENABLE_DRAFTS=false
ENABLE_INCREMENTAL=false
CUSTOM_PORT=""
CUSTOM_HOST="localhost"
OPEN_BROWSER=false

show_help() {
    cat << EOF
Usage: ./scripts/deploy.sh [OPTIONS]

Start Jekyll development server with automatic port detection.

OPTIONS:
    -h, --help              Show this help message and exit
    -p, --port PORT         Use specific port instead of auto-detection
    --host HOST             Bind to specific host (default: localhost)
    --no-livereload         Disable live reload feature
    --drafts                Include draft posts in the build
    --incremental           Enable incremental rebuilds (faster)
    --open                  Open browser automatically after server starts

EXAMPLES:
    ./scripts/deploy.sh                     # Standard development server
    ./scripts/deploy.sh --port 4000         # Use specific port
    ./scripts/deploy.sh --drafts            # Include draft posts
    ./scripts/deploy.sh --incremental       # Faster rebuilds
    ./scripts/deploy.sh --host 0.0.0.0      # Allow external connections
    ./scripts/deploy.sh --open              # Auto-open browser

NOTES:
    - Server will auto-find available ports in range ${START_PORT}-${END_PORT}
    - Live reload ports range: ${LIVERELOAD_START_PORT}-${LIVERELOAD_END_PORT}
    - Press Ctrl+C to stop the server

EOF
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            ;;
        -p|--port)
            CUSTOM_PORT="$2"
            shift 2
            ;;
        --host)
            CUSTOM_HOST="$2"
            shift 2
            ;;
        --no-livereload)
            ENABLE_LIVERELOAD=false
            shift
            ;;
        --drafts)
            ENABLE_DRAFTS=true
            shift
            ;;
        --incremental)
            ENABLE_INCREMENTAL=true
            shift
            ;;
        --open)
            OPEN_BROWSER=true
            shift
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}"
            echo "Run './scripts/deploy.sh --help' for usage information"
            exit 1
            ;;
    esac
done

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

# Determine port to use
if [ -n "$CUSTOM_PORT" ]; then
    echo -e "${BLUE}Using custom port: ${CUSTOM_PORT}${NC}"
    if ! is_port_available $CUSTOM_PORT; then
        echo -e "${YELLOW}⚠ Warning: Port ${CUSTOM_PORT} is already in use${NC}"
        echo -e "${YELLOW}Server may fail to start or conflict with existing service${NC}"
    fi
    PORT=$CUSTOM_PORT
else
    # Find an available port
    PORT=$(find_available_port)

    if [ -z "$PORT" ]; then
        echo -e "${RED}Failed to find an available port. Exiting.${NC}"
        exit 1
    fi
fi

# Build Jekyll command with options
JEKYLL_CMD="bundle exec jekyll serve --port $PORT --host $CUSTOM_HOST"

# Add livereload if enabled
if [ "$ENABLE_LIVERELOAD" = true ]; then
    LIVERELOAD_PORT=$(find_available_livereload_port)

    if [ -z "$LIVERELOAD_PORT" ]; then
        echo -e "${RED}Failed to find an available livereload port. Disabling livereload.${NC}"
    else
        JEKYLL_CMD="$JEKYLL_CMD --livereload --livereload-port $LIVERELOAD_PORT"
    fi
fi

# Add drafts if enabled
if [ "$ENABLE_DRAFTS" = true ]; then
    JEKYLL_CMD="$JEKYLL_CMD --drafts"
fi

# Add incremental if enabled
if [ "$ENABLE_INCREMENTAL" = true ]; then
    JEKYLL_CMD="$JEKYLL_CMD --incremental"
fi

# Display server configuration
echo ""
echo -e "${GREEN}🚀 Starting Jekyll server...${NC}"
echo -e "${YELLOW}📍 URL: http://${CUSTOM_HOST}:${PORT}${NC}"
[ "$ENABLE_LIVERELOAD" = true ] && [ -n "$LIVERELOAD_PORT" ] && \
    echo -e "${GREEN}🔄 Live reload: enabled (port ${LIVERELOAD_PORT})${NC}"
[ "$ENABLE_DRAFTS" = true ] && \
    echo -e "${BLUE}📝 Drafts: included${NC}"
[ "$ENABLE_INCREMENTAL" = true ] && \
    echo -e "${BLUE}⚡ Incremental builds: enabled${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop the server${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Open browser if requested
if [ "$OPEN_BROWSER" = true ]; then
    echo -e "${GREEN}🌐 Opening browser...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "http://${CUSTOM_HOST}:${PORT}" &
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "http://${CUSTOM_HOST}:${PORT}" &
    else
        echo -e "${YELLOW}⚠ Auto-open not supported on this platform${NC}"
    fi
fi

# Start Jekyll with the configured options
$JEKYLL_CMD
