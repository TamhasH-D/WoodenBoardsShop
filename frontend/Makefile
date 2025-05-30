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
	@echo "Docker commands:"
	@echo "  make up          - Start all frontend services"
	@echo "  make down        - Stop and remove all frontend services containers"
	@echo "  make build       - Build all frontend services"
	@echo "  make rebuild     - Rebuild and restart all frontend services"
	@echo "  make restart     - Restart all frontend services"
	@echo "  make logs        - View logs from all frontend services containers"
	@echo "  make ps          - List all running frontend services containers"
	@echo ""
	@echo "Local development commands:"
	@echo "  make install     - Install dependencies for all frontend apps"
	@echo "  make build-local - Build all frontend applications locally"
	@echo "  make clean       - Clean node_modules and package-lock.json"
	@echo "  make dev         - Start development servers for all apps"
	@echo "  make test        - Run tests for all apps"
	@echo "  make fix-ajv     - Fix AJV compatibility issues"
	@echo "  make setup       - Complete setup (clean + install + build)"

.PHONY: up
up: # Start all microservices
	$(DOCKER_COMPOSE_ALL) up -d

.PHONY: down
down: # Stop all microservices
	$(DOCKER_COMPOSE_ALL) down

.PHONY: build
build: # Build all microservices
	$(DOCKER_COMPOSE_ALL) build --no-cache

.PHONY: rebuild
rebuild: down build up # Rebuild and restart all microservices

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


######### Local development commands #########

.PHONY: install
install: # Install dependencies for all frontend apps
	@echo "Installing dependencies for all frontend applications..."
	@for app in admin buyer seller; do \
		echo "Installing dependencies for $$app..."; \
		cd $$app && npm install --legacy-peer-deps && cd ..; \
	done
	@echo "Running AJV compatibility fixes..."
	@./fix-ajv-compatibility.sh

.PHONY: build-local
build-local: # Build all applications locally
	@echo "Building all frontend applications locally..."
	@for app in admin buyer seller; do \
		echo "Building $$app..."; \
		cd $$app && npm run build && cd ..; \
	done

.PHONY: clean
clean: # Clean all applications
	@echo "Cleaning all frontend applications..."
	@for app in admin buyer seller; do \
		echo "Cleaning $$app..."; \
		rm -rf $$app/node_modules $$app/package-lock.json; \
	done

.PHONY: dev
dev: # Start development servers
	@echo "Starting development servers..."
	@echo "Admin will run on http://localhost:3001"
	@echo "Buyer will run on http://localhost:3002"
	@echo "Seller will run on http://localhost:3003"
	@echo "Press Ctrl+C to stop all servers"
	@cd admin && PORT=3001 npm start &
	@cd buyer && PORT=3002 npm start &
	@cd seller && PORT=3003 npm start &
	@wait

.PHONY: test
test: # Run tests for all apps
	@echo "Running tests for all frontend applications..."
	@for app in admin buyer seller; do \
		echo "Testing $$app..."; \
		cd $$app && npm test -- --coverage --watchAll=false && cd ..; \
	done

.PHONY: fix-ajv
fix-ajv: # Fix AJV compatibility issues
	@echo "Applying AJV compatibility fixes..."
	@./fix-ajv-compatibility.sh

.PHONY: setup
setup: clean install build-local # Complete setup for new environment
	@echo "Frontend setup completed successfully!"

######### End of Local development commands #########