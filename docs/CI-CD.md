# CI/CD Documentation for Diplom Project

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
├── frontend/                     # Frontend applications
├── .gitlab-ci.yml               # GitLab CI/CD pipeline
├── docker-compose.yaml          # Main compose file
├── .env                         # Environment variables
└── Makefile                     # Build automation
```

## 🔄 GitLab CI/CD Pipeline

### Pipeline Stages

1. **validate** - Validates project structure and Docker configuration
2. **build** - Builds all Docker containers
3. **test** - Runs integration tests, linting, and frontend tests
4. **deploy** - Deploys to staging/production environments

### Pipeline Jobs

#### Validate Stage
- **validate**: Checks project structure and Docker Compose configuration

#### Build Stage
- **build**: Builds all services using CI configuration

#### Test Stage
- **test:integration**: Runs full integration tests with all services
- **test:lint**: Runs backend linting and unit tests
- **test:frontend**: Tests all frontend applications

#### Deploy Stage
- **deploy:staging**: Manual deployment to staging (dev branch)
- **deploy:production**: Manual deployment to production (main branch)

### Triggers
- Push to `main` or `dev` branches
- Merge requests to `main` or `dev` branches
- Manual pipeline execution

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
