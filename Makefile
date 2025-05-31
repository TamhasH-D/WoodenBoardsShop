# Diplom Project Makefile
# Simple commands for development

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
	@echo "🌐 Service URLs:"
	@echo "  Backend API:      http://localhost:8000"
	@echo "  API Docs:         http://localhost:8000/docs"

# ============================================================================
# 🚀 MAIN COMMANDS
# ============================================================================

.PHONY: up
up: ## Start all services
	$(COMPOSE) up -d

.PHONY: down
down: ## Stop all services
	$(COMPOSE) down

.PHONY: build
build: ## Build all services
	$(COMPOSE) build

.PHONY: rebuild
rebuild: down build up ## Rebuild and restart all services

.PHONY: logs
logs: ## Show logs from all services
	$(COMPOSE) logs -f

.PHONY: ps
ps: ## List running containers
	$(COMPOSE) ps

# ============================================================================
# 🔧 BACKEND COMMANDS
# ============================================================================

.PHONY: backend-up
backend-up: ## Start only backend services
	cd $(BACKEND_DIR) && $(COMPOSE) up -d

.PHONY: backend-down
backend-down: ## Stop backend services
	cd $(BACKEND_DIR) && $(COMPOSE) down

.PHONY: backend-logs
backend-logs: ## Show backend logs
	cd $(BACKEND_DIR) && $(COMPOSE) logs -f

.PHONY: backend-migrate
backend-migrate: ## Run database migrations
	cd $(BACKEND_DIR) && $(COMPOSE) exec api alembic upgrade head

# ============================================================================
# 🧹 CLEANUP & UTILITY
# ============================================================================

.PHONY: clean
clean: ## Clean Docker resources
	docker system prune -f

.PHONY: dev
dev: backend-up ## Quick start for development (backend only)
	@echo "🎯 Backend ready at http://localhost:8000/docs"