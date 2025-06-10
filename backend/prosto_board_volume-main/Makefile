# Prosto Board Volume Detection Project Makefile
# Manages the multi-service application: backend, detect, and frontend

# Docker compose command with environment file
COMPOSE_CMD = docker compose
ENV_FILE = .env

.PHONY: help
help: # Show help for each of the Makefile recipes.
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m:$$(echo $$l | cut -f 2- -d'#')\n"; done

# Main application commands
.PHONY: up
up: # Start all services with Docker Compose
	$(COMPOSE_CMD) --env-file $(ENV_FILE) up --build -d

.PHONY: down
down: # Stop all services with Docker Compose
	$(COMPOSE_CMD) --env-file $(ENV_FILE) down

.PHONY: build
build: # Build all services with Docker Compose
	$(COMPOSE_CMD) --env-file $(ENV_FILE) build --no-cache

.PHONY: rebuild
rebuild: # Rebuild and restart all services
	$(COMPOSE_CMD) --env-file $(ENV_FILE) down
	$(COMPOSE_CMD) --env-file $(ENV_FILE) build --no-cache
	$(COMPOSE_CMD) --env-file $(ENV_FILE) up -d

.PHONY: logs
logs: # Show logs for all services
	$(COMPOSE_CMD) --env-file $(ENV_FILE) logs -f

.PHONY: logs-backend
logs-backend: # Show logs for backend service only
	$(COMPOSE_CMD) --env-file $(ENV_FILE) logs -f backend

.PHONY: logs-detect
logs-detect: # Show logs for detect service only
	$(COMPOSE_CMD) --env-file $(ENV_FILE) logs -f detect

.PHONY: logs-frontend
logs-frontend: # Show logs for frontend service only
	$(COMPOSE_CMD) --env-file $(ENV_FILE) logs -f frontend

# Service-specific commands
.PHONY: up-backend
up-backend: # Start only backend service
	$(COMPOSE_CMD) --env-file $(ENV_FILE) up backend -d

.PHONY: up-detect
up-detect: # Start only detect service
	$(COMPOSE_CMD) --env-file $(ENV_FILE) up detect -d

.PHONY: up-frontend
up-frontend: # Start only frontend service
	$(COMPOSE_CMD) --env-file $(ENV_FILE) up frontend -d

.PHONY: restart-backend
restart-backend: # Restart backend service
	$(COMPOSE_CMD) --env-file $(ENV_FILE) restart backend

.PHONY: restart-detect
restart-detect: # Restart detect service
	$(COMPOSE_CMD) --env-file $(ENV_FILE) restart detect

.PHONY: restart-frontend
restart-frontend: # Restart frontend service
	$(COMPOSE_CMD) --env-file $(ENV_FILE) restart frontend

# Development commands
.PHONY: shell-backend
shell-backend: # Open shell in backend container
	$(COMPOSE_CMD) --env-file $(ENV_FILE) exec backend /bin/bash

.PHONY: shell-detect
shell-detect: # Open shell in detect container
	$(COMPOSE_CMD) --env-file $(ENV_FILE) exec detect /bin/bash

.PHONY: run-backend-local
run-backend-local: # Run backend locally (requires uv)
	cd backend && uv run main.py

.PHONY: run-detect-local
run-detect-local: # Run detect service locally (requires uv)
	cd detect && uv run main.py

.PHONY: run-utils-local
run-utils-local: # Run utils locally (requires uv)
	cd utils && uv run main.py

# Testing commands
.PHONY: test
test: # Run tests for all services
	@echo "Running backend tests..."
	cd backend && uv run pytest --no-header -rN || echo "Backend tests completed"
	@echo "Running detect tests..."
	cd detect && uv run pytest --no-header -rN || echo "Detect tests completed"
	@echo "Running utils tests..."
	cd utils && uv run pytest --no-header -rN || echo "Utils tests completed"

.PHONY: test-backend
test-backend: # Run backend tests only
	cd backend && uv run pytest -v

.PHONY: test-detect
test-detect: # Run detect service tests only
	cd detect && uv run pytest -v

.PHONY: test-utils
test-utils: # Run utils tests only
	cd utils && uv run pytest -v

# Linting and formatting commands
.PHONY: lint
lint: # Run linters for all services
	@echo "Linting backend..."
	cd backend && uv run ruff format . && uv run ruff check . --fix || echo "Backend linting completed"
	@echo "Linting detect..."
	cd detect && uv run ruff format . && uv run ruff check . --fix || echo "Detect linting completed"
	@echo "Linting utils..."
	cd utils && uv run ruff format . && uv run ruff check . --fix || echo "Utils linting completed"

.PHONY: lint-backend
lint-backend: # Run linters for backend only
	cd backend && uv run ruff format . && uv run ruff check . --fix

.PHONY: lint-detect
lint-detect: # Run linters for detect service only
	cd detect && uv run ruff format . && uv run ruff check . --fix

.PHONY: lint-utils
lint-utils: # Run linters for utils only
	cd utils && uv run ruff format . && uv run ruff check . --fix

# Dependency management
.PHONY: install-deps
install-deps: # Install dependencies for all services
	@echo "Installing backend dependencies..."
	cd backend && uv sync
	@echo "Installing detect dependencies..."
	cd detect && uv sync
	@echo "Installing utils dependencies..."
	cd utils && uv sync

.PHONY: update-deps
update-deps: # Update dependencies for all services
	@echo "Updating backend dependencies..."
	cd backend && uv lock --upgrade
	@echo "Updating detect dependencies..."
	cd detect && uv lock --upgrade
	@echo "Updating utils dependencies..."
	cd utils && uv lock --upgrade

# Health and status commands
.PHONY: status
status: # Show status of all services
	$(COMPOSE_CMD) --env-file $(ENV_FILE) ps

.PHONY: health
health: # Check health of all services
	@echo "Checking service health..."
	@curl -f http://localhost:$${BACKEND_PORT:-8000}/health 2>/dev/null && echo "✓ Backend is healthy" || echo "✗ Backend is not responding"
	@curl -f http://localhost:$${DETECT_PORT:-8001}/health 2>/dev/null && echo "✓ Detect service is healthy" || echo "✗ Detect service is not responding"

# Cleanup commands
.PHONY: clean
clean: # Clean up Docker resources
	$(COMPOSE_CMD) --env-file $(ENV_FILE) down --volumes --remove-orphans
	docker system prune -f

.PHONY: clean-all
clean-all: # Clean up all Docker resources including images
	$(COMPOSE_CMD) --env-file $(ENV_FILE) down --volumes --remove-orphans --rmi all
	docker system prune -af
	docker volume prune -f

# Environment setup
.PHONY: setup
setup: # Setup development environment
	@echo "Setting up development environment..."
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "Creating .env file from example..."; \
		cp .env.example $(ENV_FILE) 2>/dev/null || echo "No .env.example found. Please create $(ENV_FILE) manually."; \
	fi
	$(MAKE) install-deps
	@echo "Setup complete!"
