#!/bin/bash

# Quick Start Script for All Services
# This script provides a simple way to start all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[HEADER]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yaml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_header "🚀 Starting Diplom Project Services"
echo "====================================="

# Parse command line arguments
MODE="prod"
REBUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dev)
            MODE="dev"
            shift
            ;;
        --ci)
            MODE="ci"
            shift
            ;;
        --rebuild)
            REBUILD=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dev      Start in development mode"
            echo "  --ci       Start in CI mode"
            echo "  --rebuild  Rebuild containers before starting"
            echo "  --help     Show this help message"
            echo ""
            echo "Default: Production mode"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_status "Mode: $MODE"
if [ "$REBUILD" = true ]; then
    print_status "Rebuild: enabled"
fi

# Stop any running containers
print_status "Stopping any running containers..."
make down || true

# Rebuild if requested
if [ "$REBUILD" = true ]; then
    print_status "Rebuilding all services..."
    case $MODE in
        dev)
            make build-dev
            ;;
        ci)
            make build-ci
            ;;
        *)
            make build-prod
            ;;
    esac
fi

# Start services based on mode
print_status "Starting services in $MODE mode..."
case $MODE in
    dev)
        make up-dev
        ;;
    ci)
        make up-ci
        ;;
    *)
        make up-prod
        ;;
esac

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Show status
print_status "Checking service status..."
make ps

print_header "🎉 Services Started Successfully!"
echo ""
print_status "Available services:"

case $MODE in
    dev)
        print_status "  - Backend API: http://localhost:8000"
        print_status "  - Admin Frontend: http://localhost:3000"
        print_status "  - Seller Frontend: http://localhost:3001"
        print_status "  - Buyer Frontend: http://localhost:3002"
        ;;
    *)
        print_status "  - Backend API: http://localhost:8000"
        print_status "  - Admin Frontend: http://localhost:8080"
        print_status "  - Seller Frontend: http://localhost:8081"
        print_status "  - Buyer Frontend: http://localhost:8082"
        ;;
esac

print_status "  - Prosto Board Backend: http://localhost:8001"
print_status "  - Detection Service: http://localhost:8002"

echo ""
print_status "Useful commands:"
print_status "  make logs         - View all service logs"
print_status "  make health-check - Check service health"
print_status "  make down         - Stop all services"
print_status "  make ps           - Show running containers"

echo ""
print_warning "To stop all services, run: make down"
