# Load environment variables from .env file
include .env

######### Global environment variables #########

ENV_FILE := .env
USE_COMPOSE := docker compose --env-file $(ENV_FILE)

######### End of Global environment variables #########


######### Backend environment variables #########

BACKEND_COMPOSE_FILE := backend/backend/docker-compose.yaml

######### End of Backend environment variables #########


######### All microservices #########

.PHONY: up
up: # Start all microservices
	$(USE_COMPOSE) up -d

.PHONY: down
down: # Stop all microservices
	$(USE_COMPOSE) down

.PHONY: build
build: # Build all microservices
	$(USE_COMPOSE) build --no-cache

.PHONY: restart
restart: # Restart all microservices
	$(USE_COMPOSE) restart

.PHONY: logs
logs: # Show the logs of all microservices
	$(USE_COMPOSE) logs -f

######### End of All microservices #########