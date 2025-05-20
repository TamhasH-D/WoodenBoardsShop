# Load environment variables from .env file
include .env

######### Backend environment variables #########

BACKEND_ENV_VARS := \
	BACKEND_HOST=$(BACKEND_HOST) \
	BACKEND_PORT=$(BACKEND_PORT) \
	BACKEND_DEBUG=$(BACKEND_DEBUG) \
	BACKEND_LOG_LEVEL=$(BACKEND_LOG_LEVEL) \
	BACKEND_RELOAD=$(BACKEND_RELOAD) \
	BACKEND_WORKERS=$(BACKEND_WORKERS) \
	BACKEND_PG_HOST=$(BACKEND_PG_HOST) \
	BACKEND_PG_PORT=$(BACKEND_PG_PORT) \
	BACKEND_PG_USER=$(BACKEND_PG_USER) \
	BACKEND_PG_PASSWORD=$(BACKEND_PG_PASSWORD) \
	BACKEND_PG_DATABASE=$(BACKEND_PG_DATABASE) \
	BACKEND_REDIS_HOST=$(BACKEND_REDIS_HOST) \
	BACKEND_REDIS_PORT=$(BACKEND_REDIS_PORT) \
	BACKEND_REDIS_PASSWORD=$(BACKEND_REDIS_PASSWORD) \
	BACKEND_REDIS_MAX_CONNECTIONS=$(BACKEND_REDIS_MAX_CONNECTIONS)

BACKEND_COMPOSE_FILE := backend/backend/docker-compose.yaml

######### End of Backend environment variables #########


######## All microservices #########

.PHONY: up
up: # Start all microservices
	$(BACKEND_ENV_VARS) docker-compose -f $(BACKEND_COMPOSE_FILE) up -d

.PHONY: down
down: # Stop all microservices
	$(BACKEND_ENV_VARS) docker-compose -f $(BACKEND_COMPOSE_FILE) down

.PHONY: build
build: # Build all microservices
	$(BACKEND_ENV_VARS) docker-compose -f $(BACKEND_COMPOSE_FILE) build --no-cache

.PHONY: restart
restart: # Restart all microservices
	$(BACKEND_ENV_VARS) docker-compose -f $(BACKEND_COMPOSE_FILE) restart

.PHONY: logs
logs: # Show the logs of all microservices
	$(BACKEND_ENV_VARS) docker-compose -f $(BACKEND_COMPOSE_FILE) logs -f

######### End of all microservices #########



######### Backend #########

.PHONY: backend-up
backend-up: # Start the backend services
	$(BACKEND_ENV_VARS) docker-compose -f $(BACKEND_COMPOSE_FILE) up -d

.PHONY: backend-down
backend-down: # Stop the backend services
	$(BACKEND_ENV_VARS) docker-compose -f $(BACKEND_COMPOSE_FILE) down

.PHONY: backend-build
backend-build: # Build the backend services
	$(BACKEND_ENV_VARS) docker-compose -f $(BACKEND_COMPOSE_FILE) build --no-cache

.PHONY: backend-restart
backend-restart: # Restart the backend services
	$(BACKEND_ENV_VARS) docker-compose -f $(BACKEND_COMPOSE_FILE) restart

.PHONY: backend-logs
backend-logs: # Show the logs of the backend services
	$(BACKEND_ENV_VARS) docker-compose -f $(BACKEND_COMPOSE_FILE) logs -f

######### End of Backend #########