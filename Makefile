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
	@printf "\033[0;32m🚀 Diplom Project - Available Commands\033[0m\n"
	@printf "\033[1;33m======================================\033[0m\n"
	@printf "\n"
	@printf "\033[0;34m📦 Main Commands:\033[0m\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -v "^help:" | grep -v "^help-test:" | grep -v "^test-" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@printf "\n"
	@printf "\033[0;34m🌐 Service URLs (accessible from host system):\033[0m\n"
	@printf "  Backend API:      http://localhost:$(BACKEND_PORT)\n"
	@printf "  API Docs:         http://localhost:$(BACKEND_PORT)/docs\n"
	@printf "  Admin Frontend:   http://localhost:$(FRONTEND_ADMIN_PORT)\n"
	@printf "  Seller Frontend:  http://localhost:$(FRONTEND_SELLER_PORT)\n"
	@printf "  Buyer Frontend:   http://localhost:$(FRONTEND_BUYER_PORT)\n"
	@printf "  YOLO Backend:     http://localhost:$(PROSTO_BOARD_PORT)\n"
	@printf "  YOLO Detect:      http://localhost:$(DETECT_PORT)\n"

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
rebuild: down  build up ## Rebuild and restart all services

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

.PHONY: clean-all
clean-all: down ## Clean all Docker resources including networks
	docker system prune -af
	docker network prune -f


.PHONY: dev
dev: backend-up ## Quick start for development (backend only)
	@echo "🎯 Backend ready at http://localhost:$(BACKEND_PORT)/docs"

# ============================================================================
# 📊 DATA GENERATION
# ============================================================================

.PHONY: add-data
add-data: ## Generate synthetic data for database
	@echo "🚀 Generating synthetic data..."
	cd data-generator && python -m pip install -r requirements.txt --quiet
	cd data-generator && python generate_data.py

.PHONY: rm-data
rm-data: ## Remove all synthetic data from database
	@echo "🗑️ Removing synthetic data..."
	cd data-generator && python remove_data.py