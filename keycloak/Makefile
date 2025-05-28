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

######### Keycloak environment variables #########

KEYCLOAK_COMPOSE_FILE := docker-compose.yaml

######### End of Keycloak environment variables #########

######### Keycloak commands #########

.PHONY: up
up: up-prod # Start Keycloak (default - production mode)

.PHONY: up-dev
up-dev: # Start Keycloak in development mode
	$(USE_COMPOSE_DEV) -f $(KEYCLOAK_COMPOSE_FILE) up -d

.PHONY: up-prod
up-prod: # Start Keycloak in production mode
	$(USE_COMPOSE_PROD) -f $(KEYCLOAK_COMPOSE_FILE) up -d

.PHONY: down
down: # Stop Keycloak
	$(USE_COMPOSE) -f $(KEYCLOAK_COMPOSE_FILE) down

.PHONY: build
build: build-prod # Build Keycloak (default - production mode)

.PHONY: build-dev
build-dev: # Build Keycloak in development mode
	$(USE_COMPOSE_DEV) -f $(KEYCLOAK_COMPOSE_FILE) build --no-cache

.PHONY: build-prod
build-prod: # Build Keycloak in production mode
	$(USE_COMPOSE_PROD) -f $(KEYCLOAK_COMPOSE_FILE) build --no-cache

.PHONY: restart
restart: # Restart Keycloak
	$(USE_COMPOSE) -f $(KEYCLOAK_COMPOSE_FILE) restart

.PHONY: logs
logs: # Show Keycloak logs
	$(USE_COMPOSE) -f $(KEYCLOAK_COMPOSE_FILE) logs -f

.PHONY: ps
ps: # List running Keycloak containers
	$(USE_COMPOSE) -f $(KEYCLOAK_COMPOSE_FILE) ps

######### End of Keycloak commands #########
