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
USE_COMPOSE_CI := docker compose --env-file $(ENV_FILE) -f docker-compose.ci.yml

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
	@echo "  make up-ci        - Start all services in CI mode"
	@echo "  make up           - Start all services (default - production mode)"
	@echo "  make down         - Stop and remove all containers"
	@echo "  make build-dev    - Build all services in development mode"
	@echo "  make build-prod   - Build all services in production mode"
	@echo "  make build-ci     - Build all services in CI mode"
	@echo "  make build        - Build all services (default - production mode)"
	@echo "  make rebuild-dev  - Rebuild and restart all services in development mode"
	@echo "  make rebuild-prod - Rebuild and restart all services in production mode"
	@echo "  make rebuild-ci   - Rebuild and restart all services in CI mode"
	@echo "  make rebuild      - Rebuild and restart all services (default - production mode)"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - View logs from all containers"
	@echo "  make ps           - List all running containers"
	@echo "  make test-ci      - Run local CI/CD test"
	@echo "  make health-check - Check health of all services"

.PHONY: up
up: up-prod # Start all microservices (default - production mode)

.PHONY: up-dev
up-dev: # Start all microservices in development mode
	$(USE_COMPOSE_DEV) up -d

.PHONY: up-prod
up-prod: # Start all microservices in production mode
	$(USE_COMPOSE_PROD) up -d

.PHONY: up-ci
up-ci: # Start all microservices in CI mode
	$(USE_COMPOSE_CI) up -d

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

.PHONY: build-ci
build-ci: # Build all microservices in CI mode
	$(USE_COMPOSE_CI) build --no-cache

.PHONY: rebuild
rebuild: rebuild-prod # Rebuild and restart all microservices (default - production mode)

.PHONY: rebuild-dev
rebuild-dev: down build-dev up-dev # Rebuild and restart all microservices in development mode

.PHONY: rebuild-prod
rebuild-prod: down build-prod up-prod # Rebuild and restart all microservices in production mode

.PHONY: rebuild-ci
rebuild-ci: down build-ci up-ci # Rebuild and restart all microservices in CI mode

.PHONY: restart
restart: # Restart all microservices
	$(USE_COMPOSE) restart

.PHONY: logs
logs: # Show the logs of all microservices
	$(USE_COMPOSE) logs -f

.PHONY: ps
ps: # List all running containers
	$(USE_COMPOSE) ps

.PHONY: test-ci
test-ci: # Run local CI/CD test
	@echo "Running local CI/CD test..."
	./scripts/test-ci-cd.sh

.PHONY: health-check
health-check: # Check health of all services
	@echo "Checking health of all services..."
	@echo "=== Container Status ==="
	$(USE_COMPOSE) ps
	@echo ""
	@echo "=== Health Checks ==="
	@echo "Backend API:"
	@curl -f http://localhost:8000/docs > /dev/null 2>&1 && echo "✅ Backend API: OK" || echo "❌ Backend API: FAILED"
	@curl -f http://localhost:8000/health > /dev/null 2>&1 && echo "✅ Backend Health: OK" || echo "⚠️  Backend Health: Not Available"
	@echo "Frontend Services:"
	@curl -f http://localhost:8080 > /dev/null 2>&1 && echo "✅ Admin Frontend: OK" || echo "❌ Admin Frontend: FAILED"
	@curl -f http://localhost:8081 > /dev/null 2>&1 && echo "✅ Seller Frontend: OK" || echo "❌ Seller Frontend: FAILED"
	@curl -f http://localhost:8082 > /dev/null 2>&1 && echo "✅ Buyer Frontend: OK" || echo "❌ Buyer Frontend: FAILED"

######### End of All microservices #########