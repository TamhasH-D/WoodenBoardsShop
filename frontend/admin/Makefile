# Admin Frontend Makefile

# Load environment variables from .env file
-include .env

######### Environment variables #########

ENV_FILE := .env

# Docker compose commands
USE_COMPOSE := docker compose --env-file $(ENV_FILE)
USE_COMPOSE_DEV := NODE_ENV=development docker compose -f docker-compose.dev.yaml --env-file $(ENV_FILE)
USE_COMPOSE_PROD := NODE_ENV=production docker compose -f docker-compose.yaml --env-file $(ENV_FILE)

######### All commands #########

.PHONY: help
help: # Show help
	@echo "Admin Frontend Makefile"
	@echo "----------------------"
	@echo "Available commands:"
	@echo "  make up-dev       - Start in development mode"
	@echo "  make up-prod      - Start in production mode"
	@echo "  make up           - Start in production mode (default)"
	@echo "  make down         - Stop all containers"
	@echo "  make build-dev    - Build in development mode"
	@echo "  make build-prod   - Build in production mode"
	@echo "  make build        - Build in production mode (default)"
	@echo "  make logs         - View logs"
	@echo "  make ps           - List running containers"

.PHONY: up
up: up-prod # Start in production mode (default)

.PHONY: up-dev
up-dev: # Start in development mode
	$(USE_COMPOSE_DEV) up -d

.PHONY: up-prod
up-prod: # Start in production mode
	$(USE_COMPOSE_PROD) up -d

.PHONY: down
down: # Stop all containers
	$(USE_COMPOSE) down

.PHONY: build
build: build-prod # Build in production mode (default)

.PHONY: build-dev
build-dev: # Build in development mode
	$(USE_COMPOSE_DEV) build --no-cache

.PHONY: build-prod
build-prod: # Build in production mode
	$(USE_COMPOSE_PROD) build --no-cache

.PHONY: logs
logs: # View logs
	$(USE_COMPOSE) logs -f

.PHONY: ps
ps: # List running containers
	$(USE_COMPOSE) ps
