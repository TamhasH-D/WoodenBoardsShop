DOCKER_CMD = docker exec -it backend-api

.PHONY: help
help: # Show help for each of the Makefile recipes.
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m:$$(echo $$l | cut -f 2- -d'#')\n"; done

.PHONY: run
run: # Run the application.
	uv run -m backend

.PHONY: up
up: # Start the project with Docker Compose.
	docker compose --env-file .env up --build  -d

.PHONY: up-dev
up-dev: # Start the project in development mode with file watching.
	docker compose --env-file .env -f docker-compose.yaml -f docker-compose.dev.yaml up --build

.PHONY: down
down: # Stop the project with Docker Compose.
	docker compose --env-file .env down

.PHONY: build
build: # Build the project with Docker Compose.
	docker compose --env-file .env build --no-cache

.PHONY: rebuild
rebuild: down build up # Rebuild and restart all microservices

.PHONY: logs
logs: # Show the logs of the project with Docker Compose.
	docker compose --env-file .env logs -f

.PHONY: test
test: # Run all tests in the codebase.
	$(DOCKER_CMD) pytest ./tests -v -s -W ignore::DeprecationWarning

.PHONY: test-filter
test-filter: # Run tests with a specific filter.
	$(DOCKER_CMD) pytest ./tests -v -s -k $(filter)

.PHONY: test-coverage
test-coverage: # Run tests with coverage.
	$(DOCKER_CMD) pytest --cov=backend tests/

.PHONY: mig-gen
mig-gen: # Generate a new migration file.
	$(DOCKER_CMD) alembic revision --autogenerate -m "$(name)"

.PHONY: mig-head
mig-head: # Migrate to the latest version.
	$(DOCKER_CMD) alembic upgrade head

.PHONY: mig-up
mig-up: # Migrate to the next version.
	$(DOCKER_CMD) alembic upgrade +1

.PHONY: mig-down
mig-down: # Migrate to the previous version.
	$(DOCKER_CMD) alembic downgrade -1

.PHONY: lint
lint: # Run linters on the codebase.
	uv run ruff format backend tests
	uv run ruff check backend tests --fix --unsafe-fixes
	uv run mypy backend
