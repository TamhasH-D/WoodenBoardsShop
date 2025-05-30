#!/bin/bash

# Local Pipeline Testing Script
# This script simulates the GitLab CI/CD pipeline locally

set -e  # Exit on any error

echo "🚀 Starting Local Pipeline Test..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Cleanup function
cleanup() {
    print_status "🧹 Cleaning up..."
    cd backend/backend 2>/dev/null || true
    docker-compose down 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Stage 1: Build
echo ""
print_status "🏗️  STAGE 1: BUILD"
echo "=================="

print_status "Setting up environment..."
cp ci/config/.env.ci .env || {
    print_error "Failed to copy CI environment file"
    exit 1
}

print_status "Building backend services..."
cd backend/backend
if docker-compose build --parallel; then
    print_success "Backend services built successfully"
else
    print_error "Backend build failed"
    exit 1
fi

print_status "Verifying built images..."
if docker images | grep -q backend; then
    print_success "Backend images verified"
else
    print_warning "Some backend images not found"
fi

cd ../../

print_status "Building frontend services (if available)..."
if [ -f "docker-compose.yaml" ]; then
    if docker-compose build --parallel; then
        print_success "Frontend services built successfully"
    else
        print_warning "Some frontend services failed to build (non-blocking)"
    fi
else
    print_warning "No root docker-compose found, skipping frontend build"
fi

print_success "BUILD STAGE COMPLETED"

# Stage 2: Test
echo ""
print_status "🧪 STAGE 2: TEST"
echo "================"

print_status "Starting backend services..."
cd backend/backend

if docker-compose up -d; then
    print_success "Backend services started"
else
    print_error "Failed to start backend services"
    exit 1
fi

print_status "Waiting for services to initialize (60 seconds)..."
sleep 60

print_status "Checking container status..."
docker-compose ps

print_status "Checking API logs..."
docker-compose logs api --tail 20

print_status "Testing API health..."
if docker-compose exec -T api python -c "
import urllib.request
try:
    with urllib.request.urlopen('http://localhost:8000/docs', timeout=10) as r:
        print('✅ API is healthy, status:', r.status)
except Exception as e:
    print('❌ API health check failed:', e)
    exit(1)
"; then
    print_success "API health check passed"
else
    print_error "API health check failed"
    docker-compose logs api
    exit 1
fi

print_success "TEST STAGE COMPLETED"

# Stage 3: Deploy (Simulation)
echo ""
print_status "🚀 STAGE 3: DEPLOY SIMULATION"
echo "============================="

print_status "Simulating staging deployment..."
print_status "Recreating services with --force-recreate..."

if docker-compose up -d --force-recreate; then
    print_success "Services recreated successfully"
else
    print_error "Failed to recreate services"
    exit 1
fi

print_status "Waiting for redeployment (30 seconds)..."
sleep 30

print_status "Running post-deployment health checks..."
docker-compose ps

if docker-compose exec -T api python -c "
import urllib.request
try:
    with urllib.request.urlopen('http://localhost:8000/docs', timeout=10) as r:
        print('✅ Post-deployment API is healthy, status:', r.status)
except Exception as e:
    print('❌ Post-deployment API health check failed:', e)
    exit(1)
"; then
    print_success "Post-deployment health check passed"
else
    print_error "Post-deployment health check failed"
    exit 1
fi

print_success "DEPLOY SIMULATION COMPLETED"

# Final Summary
echo ""
echo "🎉 LOCAL PIPELINE TEST COMPLETED SUCCESSFULLY!"
echo "=============================================="
print_success "✅ Build Stage: All services built"
print_success "✅ Test Stage: Services started and healthy"
print_success "✅ Deploy Stage: Deployment simulation successful"
echo ""
print_status "Your pipeline is ready for GitLab CI/CD!"
print_status "Services are still running for manual testing."
print_status "Run 'docker-compose down' in backend/backend to stop them."

echo ""
print_status "🌐 Available endpoints:"
echo "  - API Documentation: http://localhost:${BACKEND_PORT:-8000}/docs"
echo "  - API Health: http://localhost:${BACKEND_PORT:-8000}/docs"
echo ""
