# Root Backend Makefile
# Manages both backend projects: backend/backend and backend/prosto_board_volume-main

.PHONY: help
help: # Show help for each of the Makefile recipes.
	@echo "Available commands:"
	@echo ""
	@echo "=== Root Backend Management ==="
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m:$$(echo $$l | cut -f 2- -d'#')\n"; done
	@echo ""
	@echo "=== Sub-project Commands ==="
	@echo "\033[1;34mbackend-*\033[00m: Commands for backend/backend project"
	@echo "\033[1;34mprosto-*\033[00m: Commands for prosto_board_volume-main project"

# Backend/backend project commands
.PHONY: backend-help
backend-help: # Show help for backend/backend project
	@cd backend && $(MAKE) help

.PHONY: backend-run
backend-run: # Run the backend/backend application
	@cd backend && $(MAKE) run

.PHONY: backend-up
backend-up: # Start backend/backend with Docker Compose
	@cd backend && $(MAKE) up

.PHONY: backend-down
backend-down: # Stop backend/backend Docker Compose
	@cd backend && $(MAKE) down

.PHONY: backend-build
backend-build: # Build backend/backend with Docker Compose
	@cd backend && $(MAKE) build

.PHONY: backend-logs
backend-logs: # Show backend/backend logs
	@cd backend && $(MAKE) logs

.PHONY: backend-test
backend-test: # Run backend/backend tests
	@cd backend && $(MAKE) test

.PHONY: backend-lint
backend-lint: # Run backend/backend linters
	@cd backend && $(MAKE) lint

# Prosto Board project commands
.PHONY: prosto-help
prosto-help: # Show help for prosto_board_volume-main project
	@cd prosto_board_volume-main && $(MAKE) help

.PHONY: prosto-up
prosto-up: # Start prosto_board_volume-main with Docker Compose
	@cd prosto_board_volume-main && $(MAKE) up

.PHONY: prosto-down
prosto-down: # Stop prosto_board_volume-main Docker Compose
	@cd prosto_board_volume-main && $(MAKE) down

.PHONY: prosto-build
prosto-build: # Build prosto_board_volume-main with Docker Compose
	@cd prosto_board_volume-main && $(MAKE) build

.PHONY: prosto-logs
prosto-logs: # Show prosto_board_volume-main logs
	@cd prosto_board_volume-main && $(MAKE) logs

.PHONY: prosto-test
prosto-test: # Run prosto_board_volume-main tests
	@cd prosto_board_volume-main && $(MAKE) test

.PHONY: prosto-lint
prosto-lint: # Run prosto_board_volume-main linters
	@cd prosto_board_volume-main && $(MAKE) lint

# Combined commands
.PHONY: up-all
up-all: # Start both projects
	@echo "Starting backend/backend..."
	@cd backend && $(MAKE) up
	@echo "Starting prosto_board_volume-main..."
	@cd prosto_board_volume-main && $(MAKE) up

.PHONY: down-all
down-all: # Stop both projects
	@echo "Stopping backend/backend..."
	@cd backend && $(MAKE) down
	@echo "Stopping prosto_board_volume-main..."
	@cd prosto_board_volume-main && $(MAKE) down

.PHONY: build-all
build-all: # Build both projects
	@echo "Building backend/backend..."
	@cd backend && $(MAKE) build
	@echo "Building prosto_board_volume-main..."
	@cd prosto_board_volume-main && $(MAKE) build

.PHONY: test-all
test-all: # Run tests for both projects
	@echo "Testing backend/backend..."
	@cd backend && $(MAKE) test
	@echo "Testing prosto_board_volume-main..."
	@cd prosto_board_volume-main && $(MAKE) test

.PHONY: lint-all
lint-all: # Run linters for both projects
	@echo "Linting backend/backend..."
	@cd backend && $(MAKE) lint
	@echo "Linting prosto_board_volume-main..."
	@cd prosto_board_volume-main && $(MAKE) lint

.PHONY: clean
clean: # Clean up Docker resources for both projects
	@echo "Cleaning up Docker resources..."
	@cd backend && $(MAKE) down || true
	@cd prosto_board_volume-main && $(MAKE) down || true
	@docker system prune -f
	@docker volume prune -f
