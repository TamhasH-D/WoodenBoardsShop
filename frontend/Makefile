# Frontend Makefile

# Load environment variables from .env file
-include ../.env

######### Global environment variables #########

ENV_FILE := ../.env

# Docker compose commands for all services
DOCKER_COMPOSE_ALL = docker compose --env-file $(ENV_FILE) -f ./admin/docker-compose.yaml -f ./buyer/docker-compose.yaml -f ./seller/docker-compose.yaml

######### End of Global environment variables #########


######### All microservices #########

.PHONY: help
help: # Show help
	@echo "Frontend Makefile"
	@echo "----------------------"
	@echo "Available commands:"
	@echo "  make up-dev       - Start all frontend services in development mode"
	@echo "  make up-prod      - Start all frontend services in production mode"
	@echo "  make up           - Start all frontend services (default - production mode)"
	@echo "  make down         - Stop and remove all frontend services containers"
	@echo "  make build-dev    - Build all frontend services in development mode"
	@echo "  make build-prod   - Build all frontend services in production mode"
	@echo "  make build        - Build all frontend services (default - production mode)"
	@echo "  make rebuild-dev  - Rebuild and restart all frontend services in development mode"
	@echo "  make rebuild-prod - Rebuild and restart all frontend services in production mode"
	@echo "  make rebuild      - Rebuild and restart all frontend services (default - production mode)"
	@echo "  make restart      - Restart all frontend services"
	@echo "  make logs         - View logs from all frontend services containers"
	@echo "  make ps           - List all running frontend services containers"

.PHONY: up
up: up-prod # Start all microservices (default - production mode)

.PHONY: up-dev
up-dev: # Start all microservices in development mode
	$(DOCKER_COMPOSE_ALL) --env-file ../.env.dev up -d

.PHONY: up-prod
up-prod: # Start all microservices in production mode
	$(DOCKER_COMPOSE_ALL) up -d

.PHONY: down
down: # Stop all microservices
	$(DOCKER_COMPOSE_ALL) down

.PHONY: build
build: build-prod # Build all microservices (default - production mode)

.PHONY: build-dev
build-dev: # Build all microservices in development mode
	$(DOCKER_COMPOSE_ALL) --env-file ../.env.dev build --no-cache

.PHONY: build-prod
build-prod: # Build all microservices in production mode
	$(DOCKER_COMPOSE_ALL) build --no-cache

.PHONY: rebuild
rebuild: rebuild-prod # Rebuild and restart all microservices (default - production mode)

.PHONY: rebuild-dev
rebuild-dev: down build-dev up-dev # Rebuild and restart all microservices in development mode

.PHONY: rebuild-prod
rebuild-prod: down build-prod up-prod # Rebuild and restart all microservices in production mode

.PHONY: restart
restart: # Restart all microservices
	$(DOCKER_COMPOSE_ALL) restart

.PHONY: logs
logs: # Show the logs of all microservices
	$(DOCKER_COMPOSE_ALL) logs -f

.PHONY: ps
ps: # List all running containers
	$(DOCKER_COMPOSE_ALL) ps

######### End of All microservices #########