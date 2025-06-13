#!/bin/bash

# Development Environment Status Check Script
# This script checks the status of all development services

echo "🚀 Diplom Project - Development Environment Status"
echo "=================================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Set default ports if not defined
BACKEND_PORT=${BACKEND_PORT:-8000}
FRONTEND_ADMIN_PORT=${FRONTEND_ADMIN_PORT:-8080}
FRONTEND_SELLER_PORT=${FRONTEND_SELLER_PORT:-8081}
FRONTEND_BUYER_PORT=${FRONTEND_BUYER_PORT:-8082}
PROSTO_BOARD_PORT=${PROSTO_BOARD_PORT:-8001}
DETECT_PORT=${DETECT_PORT:-8002}

# Function to check service health
check_service() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo "✅ $name: HEALTHY ($url)"
    else
        echo "❌ $name: UNHEALTHY ($url)"
    fi
}

echo "🔍 Checking Docker containers..."
docker compose -f docker-compose.dev.yaml ps

echo ""
echo "🌐 Checking service endpoints..."

# Check backend services
check_service "Backend API" "http://localhost:$BACKEND_PORT/api/v1/health"
check_service "API Documentation" "http://localhost:$BACKEND_PORT/docs"

# Check frontend services
check_service "Admin Frontend" "http://localhost:$FRONTEND_ADMIN_PORT"
check_service "Seller Frontend" "http://localhost:$FRONTEND_SELLER_PORT"
check_service "Buyer Frontend" "http://localhost:$FRONTEND_BUYER_PORT"

# Check YOLO services
check_service "YOLO Backend" "http://localhost:$PROSTO_BOARD_PORT/health"
check_service "Detection Service" "http://localhost:$DETECT_PORT/health"

echo ""
echo "📊 Service URLs:"
echo "  Backend API:      http://localhost:$BACKEND_PORT"
echo "  API Docs:         http://localhost:$BACKEND_PORT/docs"
echo "  Admin Frontend:   http://localhost:$FRONTEND_ADMIN_PORT"
echo "  Seller Frontend:  http://localhost:$FRONTEND_SELLER_PORT"
echo "  Buyer Frontend:   http://localhost:$FRONTEND_BUYER_PORT"
echo "  YOLO Backend:     http://localhost:$PROSTO_BOARD_PORT"
echo "  Detection:        http://localhost:$DETECT_PORT"

echo ""
echo "🔧 Development Commands:"
echo "  View logs:        docker compose -f docker-compose.dev.yaml logs -f"
echo "  Stop services:    docker compose -f docker-compose.dev.yaml down"
echo "  Restart service:  docker compose -f docker-compose.dev.yaml restart <service-name>"
echo "  Rebuild service:  docker compose -f docker-compose.dev.yaml build <service-name>"
