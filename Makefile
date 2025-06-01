# Diplom Project Makefile
# Simple commands for development with .env support

# Load environment variables from .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Set default values if not defined in .env
BACKEND_PORT ?= 8000
FRONTEND_ADMIN_PORT ?= 8080
FRONTEND_SELLER_PORT ?= 8081
FRONTEND_BUYER_PORT ?= 8082
BACKEND_HOST ?= localhost

# Docker compose commands with environment variables
COMPOSE := docker compose --env-file .env
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
	@echo "  Backend API:      http://$(BACKEND_HOST):$(BACKEND_PORT)"
	@echo "  API Docs:         http://$(BACKEND_HOST):$(BACKEND_PORT)/docs"

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
	$(COMPOSE) build --no-cache

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
	cd $(BACKEND_DIR) && docker compose --env-file ../../.env up -d

.PHONY: backend-down
backend-down: ## Stop backend services
	cd $(BACKEND_DIR) && docker compose down

.PHONY: backend-logs
backend-logs: ## Show backend logs
	cd $(BACKEND_DIR) && docker compose logs -f

.PHONY: backend-migrate
backend-migrate: ## Run database migrations
	cd $(BACKEND_DIR) && docker compose exec api alembic upgrade head

# ============================================================================
# 🧹 CLEANUP & UTILITY
# ============================================================================

.PHONY: clean
clean: ## Clean Docker resources
	docker system prune -f

.PHONY: dev
dev: backend-up ## Quick start for development (backend only)
	@echo "🎯 Backend ready at http://$(BACKEND_HOST):$(BACKEND_PORT)/docs"