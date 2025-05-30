# Load environment variables from .env file
-include .env

######### Global environment variables #########

ENV_FILE := .env

# Development mode settings
DEV_ENV := NODE_ENV=development COMPOSE_FILE_EXT=.dev.yaml FRONTEND_PORT=3000 CONTAINER_PORT=3000
PROD_ENV := NODE_ENV=production COMPOSE_FILE_EXT=.yaml FRONTEND_PORT=80 CONTAINER_PORT=80

# Docker compose commands
USE_COMPOSE := docker compose --env-file $(ENV_FILE)
USE_COMPOSE_DEV := $(DEV_ENV) docker compose --env-file $(ENV_FILE)
USE_COMPOSE_PROD := $(PROD_ENV) docker compose --env-file $(ENV_FILE)
USE_COMPOSE_CI := docker compose --env-file ci/config/.env.ci -f ci/config/docker-compose.ci.yml

######### End of Global environment variables #########


######### Backend environment variables #########

BACKEND_COMPOSE_FILE := backend/backend/docker-compose.yaml

######### End of Backend environment variables #########


######### All microservices #########

.PHONY: help
help: ## Show this help message
	@echo "Diplom Project - Available commands:"
	@echo ""
	@echo "=== Docker Compose Commands ==="
	@echo "  up-dev            - Start all services in development mode"
	@echo "  up-prod           - Start all services in production mode"
	@echo "  up-ci             - Start all services in CI mode"
	@echo "  up                - Start all services (default - production mode)"
	@echo "  down              - Stop and remove all containers"
	@echo "  build-dev         - Build all services in development mode"
	@echo "  build-prod        - Build all services in production mode"
	@echo "  build-ci          - Build all services in CI mode"
	@echo "  build             - Build all services (default - production mode)"
	@echo "  rebuild-dev       - Rebuild and restart all services in development mode"
	@echo "  rebuild-prod      - Rebuild and restart all services in production mode"
	@echo "  rebuild-ci        - Rebuild and restart all services in CI mode"
	@echo "  rebuild           - Rebuild and restart all services (default - production mode)"
	@echo "  restart           - Restart all services"
	@echo "  logs              - View logs from all containers"
	@echo "  ps                - List all running containers"
	@echo "  test-ci           - Run local CI/CD test"
	@echo "  health-check      - Check health of all services"
	@echo ""
	@echo "=== Standardized Service Commands ==="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -v "^help:" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2}'

.PHONY: up
up: up-prod # Start all microservices (default - production mode)

.PHONY: up-dev
up-dev: # Start all microservices in development mode
	$(USE_COMPOSE_DEV) up -d

.PHONY: up-prod
up-prod: # Start all microservices in production mode
	$(USE_COMPOSE_PROD) up -d

.PHONY: up-ci
up-ci: # Start all microservices in CI mode
	$(USE_COMPOSE_CI) up -d

.PHONY: down
down: # Stop all microservices
	$(USE_COMPOSE) down

.PHONY: build
build: build-prod # Build all microservices (default - production mode)

.PHONY: build-dev
build-dev: # Build all microservices in development mode
	$(USE_COMPOSE_DEV) build --no-cache

.PHONY: build-prod
build-prod: # Build all microservices in production mode
	$(USE_COMPOSE_PROD) build --no-cache

.PHONY: build-ci
build-ci: # Build all microservices in CI mode
	$(USE_COMPOSE_CI) build --no-cache

.PHONY: rebuild
rebuild: rebuild-prod # Rebuild and restart all microservices (default - production mode)

.PHONY: rebuild-dev
rebuild-dev: down build-dev up-dev # Rebuild and restart all microservices in development mode

.PHONY: rebuild-prod
rebuild-prod: down build-prod up-prod # Rebuild and restart all microservices in production mode

.PHONY: rebuild-ci
rebuild-ci: down build-ci up-ci # Rebuild and restart all microservices in CI mode

.PHONY: restart
restart: # Restart all microservices
	$(USE_COMPOSE) restart

.PHONY: logs
logs: # Show the logs of all microservices
	$(USE_COMPOSE) logs -f

.PHONY: ps
ps: # List all running containers
	$(USE_COMPOSE) ps

.PHONY: test-ci
test-ci: # Run local CI/CD test
	@echo "Running local CI/CD test..."
	./ci/scripts/test-ci-cd.sh

.PHONY: health-check
health-check: # Check health of all services
	@echo "Checking health of all services..."
	@echo "=== Container Status ==="
	$(USE_COMPOSE) ps
	@echo ""
	@echo "=== Health Checks ==="
	@echo "Backend API:"
	@curl -f http://localhost:8000/docs > /dev/null 2>&1 && echo "✅ Backend API: OK" || echo "❌ Backend API: FAILED"
	@curl -f http://localhost:8000/health > /dev/null 2>&1 && echo "✅ Backend Health: OK" || echo "⚠️  Backend Health: Not Available"
	@echo "Frontend Services:"
	@curl -f http://localhost:8080 > /dev/null 2>&1 && echo "✅ Admin Frontend: OK" || echo "❌ Admin Frontend: FAILED"
	@curl -f http://localhost:8081 > /dev/null 2>&1 && echo "✅ Seller Frontend: OK" || echo "❌ Seller Frontend: FAILED"
	@curl -f http://localhost:8082 > /dev/null 2>&1 && echo "✅ Buyer Frontend: OK" || echo "❌ Buyer Frontend: FAILED"

######### End of All microservices #########


######### Standardized Commands for All Services #########

# Standardized development commands
install-all: ## Install dependencies for all services
	@echo "📦 Installing dependencies for all services..."
	@cd backend && $(MAKE) install-all
	@cd frontend && $(MAKE) install-all
	@echo "✅ All dependencies installed"

build-all-services: ## Build all services using individual Makefiles
	@echo "🏗️ Building all services..."
	@cd backend && $(MAKE) build-all
	@cd frontend && $(MAKE) build-all
	@echo "✅ All services built successfully"

start-all-services: ## Start all services using individual Makefiles
	@echo "🚀 Starting all services..."
	@cd backend && $(MAKE) start-all &
	@cd frontend && $(MAKE) start-all &
	@echo "✅ All services started"

test-all-services: ## Run tests for all services
	@echo "🧪 Running tests for all services..."
	@cd backend && $(MAKE) test-all
	@cd frontend && $(MAKE) test-all
	@echo "✅ All tests completed"

lint-all-services: ## Run linting for all services
	@echo "🔍 Running linting for all services..."
	@cd backend && $(MAKE) lint-all
	@cd frontend && $(MAKE) lint-all
	@echo "✅ All linting completed"

clean-all-services: ## Clean all services
	@echo "🧹 Cleaning all services..."
	@cd backend && $(MAKE) clean-all
	@cd frontend && $(MAKE) clean-all
	@echo "✅ All services cleaned"

# Docker commands for all services
docker-build-all-services: ## Build Docker images for all services
	@echo "🐳 Building Docker images for all services..."
	@cd backend && $(MAKE) docker-build-all
	@cd frontend && $(MAKE) docker-build-all
	@echo "✅ All Docker images built"

docker-run-all-services: ## Run Docker containers for all services
	@echo "🐳 Running Docker containers for all services..."
	@cd backend && $(MAKE) docker-run-all &
	@cd frontend && $(MAKE) docker-run-all &
	@echo "✅ All Docker containers started"

docker-stop-all-services: ## Stop Docker containers for all services
	@echo "🐳 Stopping Docker containers for all services..."
	@cd backend && $(MAKE) docker-stop-all
	@cd frontend && $(MAKE) docker-stop-all
	@echo "✅ All Docker containers stopped"

docker-clean-all-services: ## Clean Docker resources for all services
	@echo "🐳 Cleaning Docker resources for all services..."
	@cd backend && $(MAKE) docker-clean-all
	@cd frontend && $(MAKE) docker-clean-all
	@echo "✅ All Docker resources cleaned"

# Health checks for all services
health-check-all-services: ## Check health of all services using individual Makefiles
	@echo "🏥 Checking health of all services..."
	@cd backend && $(MAKE) health-check-all
	@cd frontend && $(MAKE) health-check-all

# CI/CD commands for all services
ci-install-all: ## Install dependencies for CI (all services)
	@echo "🤖 Installing dependencies for CI (all services)..."
	@cd backend && $(MAKE) ci-install-all
	@cd frontend && $(MAKE) ci-install-all

ci-build-all: ## Build for CI (all services)
	@echo "🤖 Building for CI (all services)..."
	@cd backend && $(MAKE) ci-build-all
	@cd frontend && $(MAKE) ci-build-all

ci-test-all: ## Run tests for CI (all services)
	@echo "🤖 Running tests for CI (all services)..."
	@cd backend && $(MAKE) ci-test-all
	@cd frontend && $(MAKE) ci-test-all

ci-lint-all: ## Run linting for CI (all services)
	@echo "🤖 Running linting for CI (all services)..."
	@cd backend && $(MAKE) ci-lint-all
	@cd frontend && $(MAKE) ci-lint-all

# Security and maintenance
audit-all-services: ## Run security audit for all services
	@echo "🔒 Running security audit for all services..."
	@cd backend && $(MAKE) audit-all
	@cd frontend && $(MAKE) audit-all
	@echo "✅ All security audits completed"

# Information
info-all-services: ## Show information for all services
	@echo "📋 Project Information:"
	@echo ""
	@echo "=== Backend Services ==="
	@cd backend && $(MAKE) info-all
	@echo ""
	@echo "=== Frontend Services ==="
	@cd frontend && $(MAKE) info-all

# Quick commands
quick-start-all: install-all build-all-services start-all-services ## Quick setup and start for all services

quick-test-all: install-all test-all-services ## Quick install and test for all services

# Development workflow
setup-all: install-all build-all-services ## Complete setup for all services
	@echo "🎯 Setting up entire project..."
	@echo "✅ Project setup completed!"

dev-all: ## Start all services in development mode
	@echo "🚀 Starting all services in development mode..."
	@echo "Backend: http://localhost:8000"
	@echo "Admin Frontend: http://localhost:8080"
	@echo "Seller Frontend: http://localhost:8081"
	@echo "Buyer Frontend: http://localhost:8082"
	@$(MAKE) start-all-services

# Validation
validate-all: ## Validate all service configurations
	@echo "✅ Validating all service configurations..."
	@cd backend && $(MAKE) validate-backends
	@cd frontend && $(MAKE) validate-microservices
	@echo "All service configurations validated"

######### End of Standardized Commands #########