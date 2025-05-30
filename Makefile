# Diplom Project Makefile
# Simple and clean commands for development and deployment

# Load environment variables
-include .env

# Docker compose commands
COMPOSE := docker compose
BACKEND_DIR := backend/backend

.PHONY: help
help: ## Show available commands
	@echo "🚀 Diplom Project - Available Commands"
	@echo "======================================"
	@echo ""
	@echo "📦 Main Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -v "^help:" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "🌐 Service URLs (when running):"
	@echo "  Backend API:      http://localhost:$${BACKEND_PORT:-8000}"
	@echo "  API Docs:         http://localhost:$${BACKEND_PORT:-8000}/docs"
	@echo "  Admin Frontend:   http://localhost:$${FRONTEND_ADMIN_PORT:-8080}"
	@echo "  Seller Frontend:  http://localhost:$${FRONTEND_SELLER_PORT:-8081}"
	@echo "  Buyer Frontend:   http://localhost:$${FRONTEND_BUYER_PORT:-8082}"

# ============================================================================
# 🚀 MAIN COMMANDS
# ============================================================================

.PHONY: up
up: ## Start all services
	@echo "🚀 Starting all services..."
	$(COMPOSE) up -d

.PHONY: down
down: ## Stop all services
	@echo "🛑 Stopping all services..."
	$(COMPOSE) down

.PHONY: build
build: ## Build all services
	@echo "🏗️ Building all services..."
	$(COMPOSE) build

.PHONY: rebuild
rebuild: down build up ## Rebuild and restart all services

.PHONY: logs
logs: ## Show logs from all services
	$(COMPOSE) logs -f

.PHONY: ps
ps: ## List running containers
	$(COMPOSE) ps

.PHONY: restart
restart: ## Restart all services
	$(COMPOSE) restart

# ============================================================================
# 🔧 BACKEND COMMANDS
# ============================================================================

.PHONY: backend-up
backend-up: ## Start only backend services
	@echo "🚀 Starting backend services..."
	cd $(BACKEND_DIR) && $(COMPOSE) up -d

.PHONY: backend-down
backend-down: ## Stop backend services
	@echo "🛑 Stopping backend services..."
	cd $(BACKEND_DIR) && $(COMPOSE) down

.PHONY: backend-build
backend-build: ## Build backend services
	@echo "🏗️ Building backend services..."
	cd $(BACKEND_DIR) && $(COMPOSE) build

.PHONY: backend-logs
backend-logs: ## Show backend logs
	cd $(BACKEND_DIR) && $(COMPOSE) logs -f

.PHONY: backend-migrate
backend-migrate: ## Run database migrations
	@echo "🔄 Running database migrations..."
	cd $(BACKEND_DIR) && $(COMPOSE) exec api alembic upgrade head

# ============================================================================
# 🧪 TESTING & HEALTH
# ============================================================================

.PHONY: test
test: ## Run local pipeline test
	@echo "🧪 Running local pipeline test..."
	./scripts/test-pipeline-locally.sh

.PHONY: health
health: ## Check health of all services
	@echo "🩺 Checking service health..."
	@echo "=== Container Status ==="
	$(COMPOSE) ps
	@echo ""
	@echo "=== API Health Check ==="
	@echo "Checking Backend API on port $${BACKEND_PORT:-8000}..."
	@curl -f http://localhost:$${BACKEND_PORT:-8000}/docs > /dev/null 2>&1 && echo "✅ Backend API: OK" || echo "❌ Backend API: FAILED"

# ============================================================================
# 🧹 CLEANUP COMMANDS
# ============================================================================

.PHONY: clean
clean: ## Clean Docker resources
	@echo "🧹 Cleaning Docker resources..."
	docker system prune -f
	docker volume prune -f

.PHONY: clean-all
clean-all: down clean ## Stop services and clean all Docker resources

# ============================================================================
# 🎯 QUICK COMMANDS
# ============================================================================

.PHONY: dev
dev: backend-up ## Quick start for development (backend only)
	@echo "🎯 Development environment ready!"
	@echo "📍 Backend API: http://localhost:$${BACKEND_PORT:-8000}/docs"

.PHONY: setup
setup: build up ## Setup and start all services
	@echo "🎯 Project setup completed!"
	@echo "📍 Check 'make health' to verify services"