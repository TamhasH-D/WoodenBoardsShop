# Frontend Microservices Makefile
# Comprehensive management for all frontend applications

.PHONY: help install build start test lint clean docker-build docker-run docker-stop docker-clean audit

# Frontend applications
FRONTENDS := admin seller buyer
ADMIN_PORT := 8080
SELLER_PORT := 8081
BUYER_PORT := 8082

# Default target
help: ## Show this help message
	@echo "Frontend Microservices - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands for all frontends
install-all: ## Install dependencies for all frontends
	@echo "📦 Installing dependencies for all frontends..."
	@for frontend in $(FRONTENDS); do \
		echo "Installing $$frontend frontend..."; \
		cd $$frontend && $(MAKE) install && cd ..; \
	done
	@echo "✅ All frontend dependencies installed"

build-all: ## Build all frontends
	@echo "🏗️ Building all frontends..."
	@for frontend in $(FRONTENDS); do \
		echo "Building $$frontend frontend..."; \
		cd $$frontend && $(MAKE) build && cd ..; \
	done
	@echo "✅ All frontends built successfully"

test-all: ## Run tests for all frontends
	@echo "🧪 Running tests for all frontends..."
	@for frontend in $(FRONTENDS); do \
		echo "Testing $$frontend frontend..."; \
		cd $$frontend && $(MAKE) test && cd ..; \
	done
	@echo "✅ All frontend tests completed"

lint-all: ## Run linting for all frontends
	@echo "🔍 Running linting for all frontends..."
	@for frontend in $(FRONTENDS); do \
		echo "Linting $$frontend frontend..."; \
		cd $$frontend && $(MAKE) lint && cd ..; \
	done
	@echo "✅ All frontend linting completed"

clean-all: ## Clean all frontends
	@echo "🧹 Cleaning all frontends..."
	@for frontend in $(FRONTENDS); do \
		echo "Cleaning $$frontend frontend..."; \
		cd $$frontend && $(MAKE) clean && cd ..; \
	done
	@echo "✅ All frontends cleaned"

# Individual frontend commands
install-admin: ## Install admin frontend dependencies
	@cd admin && $(MAKE) install

install-seller: ## Install seller frontend dependencies
	@cd seller && $(MAKE) install

install-buyer: ## Install buyer frontend dependencies
	@cd buyer && $(MAKE) install

build-admin: ## Build admin frontend
	@cd admin && $(MAKE) build

build-seller: ## Build seller frontend
	@cd seller && $(MAKE) build

build-buyer: ## Build buyer frontend
	@cd buyer && $(MAKE) build

start-admin: ## Start admin frontend development server
	@cd admin && $(MAKE) start

start-seller: ## Start seller frontend development server
	@cd seller && $(MAKE) start

start-buyer: ## Start buyer frontend development server
	@cd buyer && $(MAKE) start

# Docker commands for all frontends
docker-build-all: ## Build Docker images for all frontends
	@echo "🐳 Building Docker images for all frontends..."
	@for frontend in $(FRONTENDS); do \
		echo "Building Docker image for $$frontend frontend..."; \
		cd $$frontend && $(MAKE) docker-build && cd ..; \
	done
	@echo "✅ All frontend Docker images built"

docker-run-all: ## Run Docker containers for all frontends
	@echo "🐳 Running Docker containers for all frontends..."
	@cd admin && $(MAKE) docker-run &
	@cd seller && $(MAKE) docker-run &
	@cd buyer && $(MAKE) docker-run &
	@echo "✅ All frontend containers started"

docker-stop-all: ## Stop Docker containers for all frontends
	@echo "🐳 Stopping Docker containers for all frontends..."
	@for frontend in $(FRONTENDS); do \
		echo "Stopping $$frontend frontend container..."; \
		cd $$frontend && $(MAKE) docker-stop && cd ..; \
	done
	@echo "✅ All frontend containers stopped"

docker-clean-all: ## Clean Docker resources for all frontends
	@echo "🐳 Cleaning Docker resources for all frontends..."
	@for frontend in $(FRONTENDS); do \
		echo "Cleaning Docker resources for $$frontend frontend..."; \
		cd $$frontend && $(MAKE) docker-clean && cd ..; \
	done
	@echo "✅ All frontend Docker resources cleaned"

# Security and maintenance for all frontends
audit-all: ## Run security audit for all frontends
	@echo "🔒 Running security audit for all frontends..."
	@for frontend in $(FRONTENDS); do \
		echo "Auditing $$frontend frontend..."; \
		cd $$frontend && $(MAKE) audit && cd ..; \
	done
	@echo "✅ All frontend security audits completed"

fix-audit-all: ## Fix security vulnerabilities for all frontends
	@echo "🔧 Fixing security vulnerabilities for all frontends..."
	@for frontend in $(FRONTENDS); do \
		echo "Fixing vulnerabilities for $$frontend frontend..."; \
		cd $$frontend && $(MAKE) fix-audit && cd ..; \
	done
	@echo "✅ All frontend vulnerabilities fixed"

# Health checks
health-check-all: ## Check health of all frontend services
	@echo "🏥 Checking health of all frontend services..."
	@echo "Admin Frontend (port $(ADMIN_PORT)):"
	@curl -f http://localhost:$(ADMIN_PORT) > /dev/null 2>&1 && echo "  ✅ Admin frontend is running" || echo "  ❌ Admin frontend is not running"
	@echo "Seller Frontend (port $(SELLER_PORT)):"
	@curl -f http://localhost:$(SELLER_PORT) > /dev/null 2>&1 && echo "  ✅ Seller frontend is running" || echo "  ❌ Seller frontend is not running"
	@echo "Buyer Frontend (port $(BUYER_PORT)):"
	@curl -f http://localhost:$(BUYER_PORT) > /dev/null 2>&1 && echo "  ✅ Buyer frontend is running" || echo "  ❌ Buyer frontend is not running"

# Development workflow commands
setup-all: install-all build-all ## Complete setup for all frontends
	@echo "🎯 Setting up all frontend microservices..."
	@echo "✅ All frontends setup completed!"

dev-all: ## Start all frontends in development mode (parallel)
	@echo "🚀 Starting all frontends in development mode..."
	@echo "Admin: http://localhost:3000"
	@echo "Seller: http://localhost:3001" 
	@echo "Buyer: http://localhost:3002"
	@echo "Note: You'll need to start each frontend in separate terminals"
	@echo "Run: make start-admin, make start-seller, make start-buyer"

# CI/CD helpers
ci-install-all: ## Install dependencies for CI (all frontends)
	@echo "🤖 Installing dependencies for CI (all frontends)..."
	@for frontend in $(FRONTENDS); do \
		echo "CI install for $$frontend frontend..."; \
		cd $$frontend && $(MAKE) ci-install && cd ..; \
	done

ci-build-all: ## Build for CI (all frontends)
	@echo "🤖 Building for CI (all frontends)..."
	@for frontend in $(FRONTENDS); do \
		echo "CI build for $$frontend frontend..."; \
		cd $$frontend && $(MAKE) ci-build && cd ..; \
	done

ci-test-all: ## Run tests for CI (all frontends)
	@echo "🤖 Running tests for CI (all frontends)..."
	@for frontend in $(FRONTENDS); do \
		echo "CI test for $$frontend frontend..."; \
		cd $$frontend && $(MAKE) ci-test && cd ..; \
	done

ci-lint-all: ## Run linting for CI (all frontends)
	@echo "🤖 Running linting for CI (all frontends)..."
	@for frontend in $(FRONTENDS); do \
		echo "CI lint for $$frontend frontend..."; \
		cd $$frontend && $(MAKE) ci-lint && cd ..; \
	done

# Information
info-all: ## Show information for all frontends
	@echo "📋 Frontend Microservices Information:"
	@echo ""
	@for frontend in $(FRONTENDS); do \
		echo "=== $$frontend Frontend ==="; \
		cd $$frontend && $(MAKE) info && cd ..; \
		echo ""; \
	done

# Quick commands
quick-start-all: install-all build-all ## Quick setup and build for all frontends

quick-test-all: install-all test-all ## Quick install and test for all frontends

# Maintenance
outdated-all: ## Check for outdated packages in all frontends
	@echo "📅 Checking for outdated packages in all frontends..."
	@for frontend in $(FRONTENDS); do \
		echo "Checking $$frontend frontend..."; \
		cd $$frontend && $(MAKE) outdated && cd ..; \
	done

# Production deployment
deploy-staging-all: build-all ## Deploy all frontends to staging
	@echo "🚀 Deploying all frontends to staging..."
	@for frontend in $(FRONTENDS); do \
		echo "Deploying $$frontend frontend to staging..."; \
		cd $$frontend && $(MAKE) deploy-staging && cd ..; \
	done
	@echo "✅ All frontends deployed to staging"

deploy-prod-all: build-all audit-all ## Deploy all frontends to production
	@echo "🚀 Deploying all frontends to production..."
	@for frontend in $(FRONTENDS); do \
		echo "Deploying $$frontend frontend to production..."; \
		cd $$frontend && $(MAKE) deploy-prod && cd ..; \
	done
	@echo "✅ All frontends deployed to production"

# Bundle analysis
analyze-all: ## Analyze bundle sizes for all frontends
	@echo "📊 Analyzing bundle sizes for all frontends..."
	@for frontend in $(FRONTENDS); do \
		echo "Analyzing $$frontend frontend..."; \
		cd $$frontend && $(MAKE) analyze && cd ..; \
	done

# Microservice-specific validation
validate-microservices: ## Validate all microservice configurations
	@echo "✅ Validating microservice configurations..."
	@cd admin && $(MAKE) info > /dev/null 2>&1 && echo "  ✅ Admin frontend configuration valid" || echo "  ❌ Admin frontend configuration invalid"
	@cd seller && $(MAKE) validate-seller > /dev/null 2>&1 && echo "  ✅ Seller frontend configuration valid" || echo "  ❌ Seller frontend configuration invalid"
	@cd buyer && $(MAKE) validate-buyer > /dev/null 2>&1 && echo "  ✅ Buyer frontend configuration valid" || echo "  ❌ Buyer frontend configuration invalid"
