# Production-Ready GitLab CI/CD Pipeline Documentation

## 🚀 Overview

This document describes the comprehensive, production-ready GitLab CI/CD pipeline for the Diplom project. The pipeline is designed to handle all microservices with robust testing, security scanning, and deployment capabilities.

## 📁 Project Structure

```
diplom/
├── ci/                           # CI/CD configuration and scripts
│   ├── config/                   # CI/CD configuration files
│   │   ├── .env.ci              # CI environment variables
│   │   └── docker-compose.ci.yml # CI-specific Docker Compose overrides
│   └── scripts/                  # CI/CD automation scripts
│       ├── test-ci-cd.sh        # Local CI/CD testing script
│       └── start-all.sh         # Quick start script
├── docs/                         # Documentation
│   ├── CI-CD.md                 # This file
│   └── DEPLOYMENT.md            # Deployment guide
├── backend/                      # Backend services
│   ├── backend/                 # Main FastAPI backend
│   └── prosto_board_volume-main/ # Detection services
├── frontend/                     # Frontend applications
│   ├── admin/                   # Admin React app
│   ├── buyer/                   # Buyer React app
│   └── seller/                  # Seller React app
├── .gitlab-ci.yml               # GitLab CI/CD pipeline
├── docker-compose.yaml          # Main compose file
├── .env                         # Environment variables
└── Makefile                     # Build automation
```

## 🔄 Pipeline Architecture

### Pipeline Stages

1. **🔍 validate** - Project structure validation and Docker configuration checks
2. **🏗️ build** - Parallel building of all Docker containers
3. **🧪 test** - Integration tests, unit tests, linting, and health checks
4. **🔒 security** - Security scanning and vulnerability assessment
5. **🚀 deploy** - Automated staging deployment and manual production deployment

### Service Coverage

The pipeline handles all project microservices:

- **Backend API** (FastAPI with PostgreSQL and Redis) - Port 8000
- **Admin Frontend** (React) - Port 8080
- **Seller Frontend** (React) - Port 8081
- **Buyer Frontend** (React) - Port 8082
- **Prosto Board Backend** - Port 8001
- **Detection Service** (YOLO) - Port 8002
- **PostgreSQL Database**
- **Redis Cache**

## 📋 Detailed Pipeline Jobs

### 🔍 VALIDATION STAGE

#### `validate:project-structure`
- **Purpose**: Comprehensive project structure and configuration validation
- **Features**:
  - Validates presence of all required files and directories
  - Checks Docker Compose configuration syntax
  - Verifies all expected services are defined
  - Ensures CI configuration files are present
- **Triggers**: All branches, MRs, manual execution
- **Duration**: ~2-3 minutes

### 🏗️ BUILD STAGE

#### `build:all-services`
- **Purpose**: Parallel building of all Docker containers with retry mechanism
- **Features**:
  - Parallel building for optimal performance
  - Retry mechanism for network issues (3 attempts)
  - Build verification and image validation
  - Resource monitoring and optimization
  - BuildKit optimization for faster builds
- **Artifacts**: Built Docker images, environment files
- **Duration**: ~10-15 minutes
- **Dependencies**: validate:project-structure

### 🧪 TEST STAGE

#### `test:integration`
- **Purpose**: Comprehensive integration testing with all services
- **Features**:
  - Starts all services with health checks
  - Waits for services with intelligent retry logic
  - Tests all API endpoints and frontend accessibility
  - Detailed error reporting and logging
  - Service status monitoring
- **Tests**:
  - Backend API endpoints (docs, health, API v1)
  - Frontend accessibility (admin, seller, buyer)
  - Prosto Board services (backend, detection)
  - Database and cache connectivity
- **Duration**: ~15-20 minutes
- **Dependencies**: build:all-services

#### `test:backend-quality`
- **Purpose**: Backend code quality and testing
- **Features**:
  - Ruff linting with GitLab integration
  - MyPy type checking with JUnit reports
  - Pytest unit testing with coverage
  - Code quality reports and artifacts
- **Reports**: JUnit XML, coverage reports, code quality
- **Duration**: ~5-8 minutes

#### `test:frontend-quality`
- **Purpose**: Frontend code quality and build testing
- **Features**:
  - Tests all three frontend applications
  - Dependency installation and caching
  - Build verification and size analysis
  - Linting and unit testing
  - Security vulnerability scanning
- **Reports**: JUnit XML, coverage reports, build artifacts
- **Duration**: ~8-12 minutes

#### `test:performance`
- **Purpose**: Basic performance testing and benchmarking
- **Features**:
  - API response time testing
  - Load testing with Apache Bench
  - Frontend performance testing
  - Performance metrics collection
- **Duration**: ~10-15 minutes
- **Triggers**: main and dev branches only

### 🔒 SECURITY STAGE

#### `security:docker-scan`
- **Purpose**: Comprehensive Docker security scanning
- **Features**:
  - Trivy security scanner integration
  - Base image vulnerability scanning
  - Application image security analysis
  - Security reports in GitLab format
- **Reports**: Container scanning reports
- **Duration**: ~8-12 minutes
- **Allow Failure**: Yes (non-blocking)

#### `security:dependency-scan`
- **Purpose**: Dependency vulnerability scanning
- **Features**:
  - Python dependency scanning with Safety
  - Node.js dependency scanning with npm audit
  - Security reports for all applications
  - Vulnerability tracking and reporting
- **Reports**: Security audit reports
- **Duration**: ~5-8 minutes
- **Allow Failure**: Yes (non-blocking)

### 🚀 DEPLOYMENT STAGE

#### `deploy:staging`
- **Purpose**: Automated staging deployment preparation
- **Features**:
  - Image tagging for staging environment
  - Environment-specific configuration
  - Deployment preparation and validation
  - Ready-to-execute deployment commands
- **Environment**: staging.yourdomain.com
- **Triggers**: dev branch (manual approval)
- **Dependencies**: build:all-services

#### `deploy:production`
- **Purpose**: Production deployment preparation
- **Features**:
  - Production image tagging (latest + commit SHA)
  - Production environment configuration
  - Comprehensive deployment checklist
  - Database migration preparation
- **Environment**: yourdomain.com
- **Triggers**: main branch (manual approval)
- **Dependencies**: build:all-services

## 🎯 Pipeline Triggers and Rules

### Automatic Triggers
- **Push to main branch**: Full pipeline with production deployment option
- **Push to dev branch**: Full pipeline with staging deployment option
- **Merge Requests**: Full pipeline except deployment
- **Manual execution**: Full pipeline available

### Branch-Specific Behavior
- **main branch**: All jobs + production deployment + performance testing
- **dev branch**: All jobs + staging deployment + performance testing
- **feature branches**: Validation, build, and test stages only
- **merge requests**: All jobs except deployment

## 🛠️ Local Development

### Quick Commands

```bash
# Start all services in production mode
make up-prod

# Start all services in development mode
make up-dev

# Start all services in CI mode (with health checks)
make up-ci

# Run local CI/CD test
make test-ci

# Check health of all services
make health-check

# Quick start with options
./ci/scripts/start-all.sh --dev --rebuild
```

### Available Make Commands

```bash
# Basic Operations
make help           # Show all available commands
make up             # Start all services (production mode)
make up-dev         # Start all services (development mode)
make up-ci          # Start all services (CI mode)
make down           # Stop all services
make ps             # List running containers
make logs           # View logs from all containers

# Build Operations
make build          # Build all services (production mode)
make build-dev      # Build all services (development mode)
make build-ci       # Build all services (CI mode)
make rebuild        # Rebuild and restart all services
make rebuild-dev    # Rebuild and restart (development mode)
make rebuild-ci     # Rebuild and restart (CI mode)

# Testing and Health Checks
make test-ci        # Run complete local CI/CD test
make health-check   # Check health of all running services
```

## 🐳 Services

### Backend Services
- **backend-api**: Main FastAPI application (port 8000)
- **postgres**: PostgreSQL database
- **redis**: Redis cache
- **detect**: YOLO detection service (port 8002)
- **backend**: Prosto Board backend (port 8001)

### Frontend Services
- **admin-frontend**: Admin interface (port 8080)
- **seller-frontend**: Seller dashboard (port 8081)
- **buyer-frontend**: Customer interface (port 8082)

## 🔧 Configuration

### CI Environment Variables (`ci/config/.env.ci`)

Optimized for CI/CD pipelines:
- Reduced logging levels
- Test database configuration
- Container networking URLs
- Disabled debug modes

### CI Docker Compose (`ci/config/docker-compose.ci.yml`)

Features:
- Health checks for all services
- Temporary storage for databases
- Optimized resource usage
- CI-specific environment overrides

## 🧪 Testing

### Local Testing
```bash
# Run complete CI/CD pipeline locally
make test-ci

# Or run the script directly
./ci/scripts/test-ci-cd.sh
```

This script:
1. Backs up current `.env` file
2. Uses CI configuration from `ci/config/.env.ci`
3. Builds and starts all services in CI mode
4. Runs health checks and API tests
5. Restores original configuration

### Manual Testing
```bash
# Start services in CI mode
make up-ci

# Test backend API
curl http://localhost:8000/docs

# Test frontend services
curl http://localhost:8080  # Admin
curl http://localhost:8081  # Seller
curl http://localhost:8082  # Buyer

# Check service health
make health-check
```

## 🚀 Deployment

### GitLab CI/CD Variables

Set these in your GitLab project settings:

```bash
# Docker Registry
DOCKER_REGISTRY_URL
DOCKER_REGISTRY_USERNAME
DOCKER_REGISTRY_PASSWORD

# Deployment
STAGING_SERVER_HOST
STAGING_SERVER_USER
STAGING_SSH_KEY

PRODUCTION_SERVER_HOST
PRODUCTION_SERVER_USER
PRODUCTION_SSH_KEY
```

### Deployment Process

1. **Staging Deployment** (dev branch):
   - Triggered manually from GitLab UI
   - Deploys to staging environment
   - Runs smoke tests

2. **Production Deployment** (main branch):
   - Triggered manually from GitLab UI
   - Deploys to production environment
   - Includes database migrations
   - Runs comprehensive tests

## 🔍 Troubleshooting

### Common Issues

1. **Pipeline Failures**
   ```bash
   # Check GitLab CI logs
   # Review job output in GitLab UI
   # Test locally with: make test-ci
   ```

2. **Service Health Check Failures**
   ```bash
   # Check service logs
   make logs
   
   # Check specific service
   docker compose logs backend-api
   ```

3. **Build Failures**
   ```bash
   # Clean rebuild
   make rebuild-ci
   
   # Check Docker resources
   docker system df
   docker system prune
   ```

### Debug Commands

```bash
# Check container status
docker compose -f ci/config/docker-compose.ci.yml ps

# View CI configuration
docker compose -f ci/config/docker-compose.ci.yml config

# Test CI environment
cp ci/config/.env.ci .env.test
docker compose --env-file .env.test config
```

## 📝 Best Practices

### Development Workflow

1. **Before Pushing**:
   ```bash
   make test-ci  # Test locally
   make health-check  # Verify services
   ```

2. **Merge Request Process**:
   - Create MR to `dev` branch
   - Wait for CI pipeline to pass
   - Review and merge

3. **Release Process**:
   - Merge `dev` to `main`
   - Manual deployment to production
   - Monitor deployment

### CI/CD Maintenance

1. **Regular Updates**:
   - Update base Docker images
   - Review and update dependencies
   - Monitor pipeline performance

2. **Security**:
   - Rotate deployment keys
   - Update secrets in GitLab
   - Review access permissions

3. **Monitoring**:
   - Set up pipeline notifications
   - Monitor deployment success rates
   - Track build times

## 🔗 Related Documentation

- [Deployment Guide](DEPLOYMENT.md)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Project README](../README.md)
