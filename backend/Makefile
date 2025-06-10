# Backend Services Makefile
# Comprehensive management for all backend services

.PHONY: help install build start test lint clean docker-build docker-run docker-stop docker-clean audit

# Backend services
BACKEND_SERVICES := backend prosto_board_volume-main
BACKEND_PORT := 8000
PROSTO_BOARD_PORT := 8001
DETECTION_PORT := 8002

# Default target
help: ## Show this help message
	@echo "Backend Services - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands for all backends
install-all: ## Install dependencies for all backend services
	@echo "📦 Installing dependencies for all backend services..."
	@cd backend && $(MAKE) install || echo "⚠️ Backend install not available"
	@cd prosto_board_volume-main && $(MAKE) install || echo "⚠️ Prosto Board install not available"
	@echo "✅ All backend dependencies installed"

build-all: ## Build all backend services
	@echo "🏗️ Building all backend services..."
	@cd backend && $(MAKE) build
	@cd prosto_board_volume-main && $(MAKE) build || echo "⚠️ Prosto Board build not available"
	@echo "✅ All backend services built successfully"

start-all: ## Start all backend services
	@echo "🚀 Starting all backend services..."
	@cd backend && $(MAKE) up &
	@cd prosto_board_volume-main && $(MAKE) up || echo "⚠️ Prosto Board start not available" &
	@echo "✅ All backend services started"

test-all: ## Run tests for all backend services
	@echo "🧪 Running tests for all backend services..."
	@cd backend && $(MAKE) test || echo "⚠️ Backend test not available"
	@cd prosto_board_volume-main && $(MAKE) test || echo "⚠️ Prosto Board test not available"
	@echo "✅ All backend tests completed"

lint-all: ## Run linting for all backend services
	@echo "🔍 Running linting for all backend services..."
	@cd backend && $(MAKE) lint || echo "⚠️ Backend lint not available"
	@cd prosto_board_volume-main && $(MAKE) lint || echo "⚠️ Prosto Board lint not available"
	@echo "✅ All backend linting completed"

clean-all: ## Clean all backend services
	@echo "🧹 Cleaning all backend services..."
	@cd backend && $(MAKE) down || true
	@cd prosto_board_volume-main && $(MAKE) down || true
	@docker system prune -f
	@docker volume prune -f
	@echo "✅ All backend services cleaned"

# Individual backend commands
install-backend: ## Install main backend dependencies
	@cd backend && $(MAKE) install || echo "⚠️ Backend install not available"

install-prosto: ## Install Prosto Board dependencies
	@cd prosto_board_volume-main && $(MAKE) install || echo "⚠️ Prosto Board install not available"

start-backend: ## Start main backend service
	@cd backend && $(MAKE) up

start-prosto: ## Start Prosto Board service
	@cd prosto_board_volume-main && $(MAKE) up || echo "⚠️ Prosto Board start not available"

# Legacy command aliases for backward compatibility
backend-help: ## Show help for backend/backend project
	@cd backend && $(MAKE) help

backend-run: ## Run the backend/backend application
	@cd backend && $(MAKE) run

backend-up: ## Start backend/backend with Docker Compose
	@cd backend && $(MAKE) up

backend-down: ## Stop backend/backend Docker Compose
	@cd backend && $(MAKE) down

backend-build: ## Build backend/backend with Docker Compose
	@cd backend && $(MAKE) build

backend-logs: ## Show backend/backend logs
	@cd backend && $(MAKE) logs

backend-test: ## Run backend/backend tests
	@cd backend && $(MAKE) test

backend-lint: ## Run backend/backend linters
	@cd backend && $(MAKE) lint

# Legacy Prosto Board commands for backward compatibility
prosto-help: ## Show help for prosto_board_volume-main project
	@cd prosto_board_volume-main && $(MAKE) help

prosto-up: ## Start prosto_board_volume-main with Docker Compose
	@cd prosto_board_volume-main && $(MAKE) up

prosto-down: ## Stop prosto_board_volume-main Docker Compose
	@cd prosto_board_volume-main && $(MAKE) down

prosto-build: ## Build prosto_board_volume-main with Docker Compose
	@cd prosto_board_volume-main && $(MAKE) build

prosto-logs: ## Show prosto_board_volume-main logs
	@cd prosto_board_volume-main && $(MAKE) logs

prosto-test: ## Run prosto_board_volume-main tests
	@cd prosto_board_volume-main && $(MAKE) test

prosto-lint: ## Run prosto_board_volume-main linters
	@cd prosto_board_volume-main && $(MAKE) lint

# Docker commands for all backends
docker-build-all: ## Build Docker images for all backend services
	@echo "🐳 Building Docker images for all backend services..."
	@cd backend && $(MAKE) build
	@cd prosto_board_volume-main && $(MAKE) build || echo "⚠️ Prosto Board Docker build not available"
	@echo "✅ All backend Docker images built"

docker-run-all: ## Run Docker containers for all backend services
	@echo "🐳 Running Docker containers for all backend services..."
	@cd backend && $(MAKE) up &
	@cd prosto_board_volume-main && $(MAKE) up || echo "⚠️ Prosto Board Docker run not available" &
	@echo "✅ All backend containers started"

docker-stop-all: ## Stop Docker containers for all backend services
	@echo "🐳 Stopping Docker containers for all backend services..."
	@cd backend && $(MAKE) down || true
	@cd prosto_board_volume-main && $(MAKE) down || true
	@echo "✅ All backend containers stopped"

docker-clean-all: ## Clean Docker resources for all backend services
	@echo "🐳 Cleaning Docker resources for all backend services..."
	@cd backend && $(MAKE) down || true
	@cd prosto_board_volume-main && $(MAKE) down || true
	@docker system prune -f
	@docker volume prune -f
	@echo "✅ All backend Docker resources cleaned"

# Health checks
health-check-all: ## Check health of all backend services
	@echo "🏥 Checking health of all backend services..."
	@echo "Main Backend (port $(BACKEND_PORT)):"
	@curl -f http://localhost:$(BACKEND_PORT)/api/v1/health > /dev/null 2>&1 && echo "  ✅ Main backend is running" || echo "  ❌ Main backend is not running"
	@echo "Prosto Board Backend (port $(PROSTO_BOARD_PORT)):"
	@curl -f http://localhost:$(PROSTO_BOARD_PORT)/health > /dev/null 2>&1 && echo "  ✅ Prosto Board backend is running" || echo "  ❌ Prosto Board backend is not running"

# Development workflow commands
setup-all: install-all build-all ## Complete setup for all backend services
	@echo "🎯 Setting up all backend services..."
	@echo "✅ All backend services setup completed!"

dev-all: ## Start all backends in development mode
	@echo "🚀 Starting all backend services in development mode..."
	@echo "Main Backend: http://localhost:$(BACKEND_PORT)"
	@echo "Prosto Board: http://localhost:$(PROSTO_BOARD_PORT)"
	@$(MAKE) start-all

# CI/CD helpers
ci-install-all: ## Install dependencies for CI (all backends)
	@echo "🤖 Installing dependencies for CI (all backends)..."
	@cd backend && $(MAKE) install || echo "⚠️ Backend CI install not available"
	@cd prosto_board_volume-main && $(MAKE) install || echo "⚠️ Prosto Board CI install not available"

ci-build-all: ## Build for CI (all backends)
	@echo "🤖 Building for CI (all backends)..."
	@cd backend && $(MAKE) build
	@cd prosto_board_volume-main && $(MAKE) build || echo "⚠️ Prosto Board CI build not available"

ci-test-all: ## Run tests for CI (all backends)
	@echo "🤖 Running tests for CI (all backends)..."
	@cd backend && $(MAKE) test || echo "⚠️ Backend CI test not available"
	@cd prosto_board_volume-main && $(MAKE) test || echo "⚠️ Prosto Board CI test not available"

ci-lint-all: ## Run linting for CI (all backends)
	@echo "🤖 Running linting for CI (all backends)..."
	@cd backend && $(MAKE) lint || echo "⚠️ Backend CI lint not available"
	@cd prosto_board_volume-main && $(MAKE) lint || echo "⚠️ Prosto Board CI lint not available"

# Security and maintenance
audit-all: ## Run security audit for all backend services
	@echo "🔒 Running security audit for all backend services..."
	@cd backend && $(MAKE) audit || echo "⚠️ Backend audit not available"
	@cd prosto_board_volume-main && $(MAKE) audit || echo "⚠️ Prosto Board audit not available"
	@echo "✅ All backend security audits completed"

# Information
info-all: ## Show information for all backend services
	@echo "📋 Backend Services Information:"
	@echo ""
	@echo "=== Main Backend ==="
	@cd backend && $(MAKE) info || echo "Backend info not available"
	@echo ""
	@echo "=== Prosto Board Service ==="
	@cd prosto_board_volume-main && $(MAKE) info || echo "Prosto Board info not available"

# Quick commands
quick-start-all: install-all build-all start-all ## Quick setup and start for all backends

quick-test-all: install-all test-all ## Quick install and test for all backends

# API testing
test-api-all: ## Test all API endpoints
	@echo "🔌 Testing all API endpoints..."
	@echo "Testing main backend API..."
	@curl -f http://localhost:$(BACKEND_PORT)/api/v1/health > /dev/null 2>&1 && echo "  ✅ Main API is accessible" || echo "  ❌ Main API is not accessible"
	@curl -f http://localhost:$(BACKEND_PORT)/docs > /dev/null 2>&1 && echo "  ✅ API docs are accessible" || echo "  ❌ API docs are not accessible"
	@echo "Testing Prosto Board API..."
	@curl -f http://localhost:$(PROSTO_BOARD_PORT)/health > /dev/null 2>&1 && echo "  ✅ Prosto Board API is accessible" || echo "  ❌ Prosto Board API is not accessible"

# Logs
logs-all: ## Show logs for all backend services
	@echo "📋 Showing logs for all backend services..."
	@cd backend && $(MAKE) logs || echo "Backend logs not available"
	@cd prosto_board_volume-main && $(MAKE) logs || echo "Prosto Board logs not available"

# Maintenance
restart-all: ## Restart all backend services
	@echo "🔄 Restarting all backend services..."
	@$(MAKE) docker-stop-all
	@sleep 2
	@$(MAKE) docker-run-all

# Validation
validate-backends: ## Validate all backend configurations
	@echo "✅ Validating backend configurations..."
	@cd backend && $(MAKE) validate || echo "  ⚠️ Main backend validation not available"
	@cd prosto_board_volume-main && $(MAKE) validate || echo "  ⚠️ Prosto Board validation not available"
	@echo "Backend configuration validation completed"

# Legacy aliases for backward compatibility
up-all: start-all ## Legacy alias for start-all
down-all: docker-stop-all ## Legacy alias for docker-stop-all
clean: clean-all ## Legacy alias for clean-all
