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

######### End of Global environment variables #########


######### Backend environment variables #########

BACKEND_COMPOSE_FILE := backend/backend/docker-compose.yaml

######### End of Backend environment variables #########


######### All microservices #########

.PHONY: help
help: # Show help
	@echo "Diplom Project Makefile"
	@echo "----------------------"
	@echo "Available commands:"
	@echo "  make up-dev       - Start all services in development mode"
	@echo "  make up-prod      - Start all services in production mode"
	@echo "  make up           - Start all services (default - production mode)"
	@echo "  make down         - Stop and remove all containers"
	@echo "  make build-dev    - Build all services in development mode"
	@echo "  make build-prod   - Build all services in production mode"
	@echo "  make build        - Build all services (default - production mode)"
	@echo "  make rebuild-dev  - Rebuild and restart all services in development mode"
	@echo "  make rebuild-prod - Rebuild and restart all services in production mode"
	@echo "  make rebuild      - Rebuild and restart all services (default - production mode)"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - View logs from all containers"
	@echo "  make ps           - List all running containers"

.PHONY: up
up: up-prod # Start all microservices (default - production mode)

.PHONY: up-dev
up-dev: # Start all microservices in development mode
	$(USE_COMPOSE_DEV) up -d

.PHONY: up-prod
up-prod: # Start all microservices in production mode
	$(USE_COMPOSE_PROD) up -d

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

.PHONY: rebuild
rebuild: rebuild-prod # Rebuild and restart all microservices (default - production mode)

.PHONY: rebuild-dev
rebuild-dev: down build-dev up-dev # Rebuild and restart all microservices in development mode

.PHONY: rebuild-prod
rebuild-prod: down build-prod up-prod # Rebuild and restart all microservices in production mode

.PHONY: restart
restart: # Restart all microservices
	$(USE_COMPOSE) restart

.PHONY: logs
logs: # Show the logs of all microservices
	$(USE_COMPOSE) logs -f

.PHONY: ps
ps: # List all running containers
	$(USE_COMPOSE) ps

######### End of All microservices #########