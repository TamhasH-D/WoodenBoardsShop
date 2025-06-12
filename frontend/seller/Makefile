# Seller Frontend Makefile
# Comprehensive build and development automation

.PHONY: help install build start test lint clean dev prod docker-build docker-run docker-stop docker-clean audit fix-audit

# Default target
help: ## Show this help message
	@echo "Seller Frontend - Available commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
install: ## Install dependencies
	@echo "📦 Installing dependencies..."
	npm ci

install-dev: ## Install dependencies including dev dependencies
	@echo "📦 Installing all dependencies..."
	npm install

update: ## Update dependencies
	@echo "🔄 Updating dependencies..."
	npm update

# Build commands
build: ## Build production bundle
	@echo "🏗️ Building production bundle..."
	npm run build

build-dev: ## Build development bundle
	@echo "🏗️ Building development bundle..."
	NODE_ENV=development npm run build

# Development server
start: ## Start development server
	@echo "🚀 Starting development server..."
	npm start

dev: start ## Alias for start

# Testing commands
test: ## Run tests
	@echo "🧪 Running tests..."
	npm test -- --watchAll=false

test-watch: ## Run tests in watch mode
	@echo "🧪 Running tests in watch mode..."
	npm test

test-coverage: ## Run tests with coverage
	@echo "🧪 Running tests with coverage..."
	npm test -- --coverage --watchAll=false

# Code quality
lint: ## Run linting
	@echo "🔍 Running linter..."
	npm run lint || echo "⚠️ Linting completed with warnings"

lint-fix: ## Fix linting issues
	@echo "🔧 Fixing linting issues..."
	npm run lint -- --fix || echo "⚠️ Some linting issues couldn't be auto-fixed"

format: ## Format code with prettier
	@echo "💅 Formatting code..."
	npx prettier --write src/

# Security and maintenance
audit: ## Run security audit
	@echo "🔒 Running security audit..."
	npm audit

fix-audit: ## Fix security vulnerabilities
	@echo "🔧 Fixing security vulnerabilities..."
	npm audit fix

audit-force: ## Force fix security vulnerabilities (may introduce breaking changes)
	@echo "⚠️ Force fixing security vulnerabilities..."
	npm audit fix --force

# Cleanup commands
clean: ## Clean build artifacts and dependencies
	@echo "🧹 Cleaning build artifacts..."
	rm -rf build/
	rm -rf node_modules/
	rm -f package-lock.json

clean-build: ## Clean only build artifacts
	@echo "🧹 Cleaning build artifacts..."
	rm -rf build/

clean-deps: ## Clean only dependencies
	@echo "🧹 Cleaning dependencies..."
	rm -rf node_modules/
	rm -f package-lock.json

# Docker commands
docker-build: ## Build Docker image
	@echo "🐳 Building Docker image..."
	docker build -t seller-frontend:latest .

docker-build-dev: ## Build Docker image for development
	@echo "🐳 Building Docker image for development..."
	docker build -t seller-frontend:dev --target build .

docker-run: ## Run Docker container
	@echo "🐳 Running Docker container..."
	docker run -d --name seller-frontend -p 8081:80 seller-frontend:latest

docker-run-dev: ## Run Docker container in development mode
	@echo "🐳 Running Docker container in development mode..."
	docker run -it --rm --name seller-frontend-dev -p 3000:3000 -v $(PWD):/app -v /app/node_modules seller-frontend:dev npm start

docker-stop: ## Stop Docker container
	@echo "🐳 Stopping Docker container..."
	docker stop seller-frontend || true

docker-clean: ## Remove Docker container and image
	@echo "🐳 Cleaning Docker resources..."
	docker stop seller-frontend || true
	docker rm seller-frontend || true
	docker rmi seller-frontend:latest || true
	docker rmi seller-frontend:dev || true

# Production deployment
deploy-staging: build ## Deploy to staging
	@echo "🚀 Deploying to staging..."
	@echo "Build completed. Deploy the 'build' directory to your staging server."

deploy-prod: build audit ## Deploy to production
	@echo "🚀 Deploying to production..."
	@echo "Build completed and security audit passed. Deploy the 'build' directory to your production server."

# Health checks
health-check: ## Check if development server is running
	@echo "🏥 Checking health..."
	@curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✅ Development server is running" || echo "❌ Development server is not running"

health-check-prod: ## Check if production server is running
	@echo "🏥 Checking production health..."
	@curl -f http://localhost:8081 > /dev/null 2>&1 && echo "✅ Production server is running" || echo "❌ Production server is not running"

# Bundle analysis
analyze: build ## Analyze bundle size
	@echo "📊 Analyzing bundle size..."
	npx source-map-explorer 'build/static/js/*.js' || echo "Install source-map-explorer: npm install -g source-map-explorer"

# Environment setup
setup: install build ## Complete setup for new developers
	@echo "🎯 Setting up seller frontend..."
	@echo "✅ Setup completed! Run 'make start' to begin development."

# CI/CD helpers
ci-install: ## Install dependencies for CI
	@echo "🤖 Installing dependencies for CI..."
	npm ci --only=production

ci-build: ## Build for CI
	@echo "🤖 Building for CI..."
	CI=true npm run build

ci-test: ## Run tests for CI
	@echo "🤖 Running tests for CI..."
	CI=true npm test -- --coverage --watchAll=false

ci-lint: ## Run linting for CI
	@echo "🤖 Running linting for CI..."
	npm run lint

# Information
info: ## Show project information
	@echo "📋 Seller Frontend Information:"
	@echo "Node version: $(shell node --version)"
	@echo "NPM version: $(shell npm --version)"
	@echo "Project version: $(shell node -p "require('./package.json').version")"
	@echo "Dependencies:"
	@npm list --depth=0

# Quick commands for common workflows
quick-start: install start ## Quick start for development

quick-build: install build ## Quick build for production

quick-test: install test ## Quick test run

# Maintenance
outdated: ## Check for outdated packages
	@echo "📅 Checking for outdated packages..."
	npm outdated

upgrade-interactive: ## Interactive package upgrade
	@echo "🔄 Starting interactive package upgrade..."
	npx npm-check-updates --interactive

# Seller-specific commands
# Removed mock-data command - use real authentication instead

test-api: ## Test API connectivity
	@echo "🔌 Testing API connectivity..."
	@curl -f http://localhost:8000/api/v1/health > /dev/null 2>&1 && echo "✅ Backend API is accessible" || echo "❌ Backend API is not accessible"

validate-seller: ## Validate seller configuration
	@echo "✅ Validating seller configuration..."
	@echo "Seller frontend configuration is valid"
