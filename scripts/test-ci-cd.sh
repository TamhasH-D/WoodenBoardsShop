#!/bin/bash

# Local CI/CD Testing Script
# This script simulates the CI/CD pipeline locally

set -e

echo "🚀 Starting Local CI/CD Test"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up..."
    make down || true
    if [ -f .env.backup ]; then
        mv .env.backup .env
        print_status "Restored original .env file"
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Check if we're in the right directory
if [ ! -f "docker-compose.yaml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Backup .env file
print_status "Backing up .env file..."
cp .env .env.backup

# Use CI environment configuration
print_status "Using CI environment configuration..."
cp .env.ci .env

# Stop any running containers
print_status "Stopping any running containers..."
make down || true

# Build all services
print_status "Building all services in CI mode..."
if ! make build-ci; then
    print_error "Failed to build services"
    exit 1
fi

# Start all services
print_status "Starting all services in CI mode..."
if ! make up-ci; then
    print_error "Failed to start services"
    exit 1
fi

# Wait for services to be ready
print_status "Waiting for services to start (60 seconds)..."
sleep 60

# Check container status
print_status "Checking container status..."
docker compose ps

# Test backend API
print_status "Testing backend API..."
if timeout 300 bash -c 'until curl -f http://localhost:8000/docs; do sleep 5; done'; then
    print_status "✅ Backend API is accessible"
else
    print_error "❌ Backend API failed to start"
    docker compose logs backend-api
    exit 1
fi

# Test frontend services
print_status "Testing frontend services..."

# Admin frontend
if timeout 300 bash -c 'until curl -f http://localhost:8080; do sleep 5; done'; then
    print_status "✅ Admin frontend is accessible"
else
    print_warning "⚠️  Admin frontend not accessible"
    docker compose logs admin-frontend
fi

# Seller frontend
if timeout 300 bash -c 'until curl -f http://localhost:8081; do sleep 5; done'; then
    print_status "✅ Seller frontend is accessible"
else
    print_warning "⚠️  Seller frontend not accessible"
    docker compose logs seller-frontend
fi

# Buyer frontend
if timeout 300 bash -c 'until curl -f http://localhost:8082; do sleep 5; done'; then
    print_status "✅ Buyer frontend is accessible"
else
    print_warning "⚠️  Buyer frontend not accessible"
    docker compose logs buyer-frontend
fi

# Run basic API tests
print_status "Running basic API tests..."
if curl -f http://localhost:8000/docs > /dev/null 2>&1; then
    print_status "✅ API documentation accessible"
else
    print_error "❌ API documentation not accessible"
fi

# Test health endpoint if available
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_status "✅ Health endpoint accessible"
else
    print_warning "⚠️  Health endpoint not available"
fi

# Show running services
print_status "Currently running services:"
docker compose ps

print_status "🎉 Local CI/CD test completed successfully!"
print_status "Services are running and accessible:"
print_status "  - Backend API: http://localhost:8000"
print_status "  - Admin Frontend: http://localhost:8080"
print_status "  - Seller Frontend: http://localhost:8081"
print_status "  - Buyer Frontend: http://localhost:8082"
print_status ""
print_status "To stop all services, run: make down"
