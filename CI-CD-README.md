# CI/CD Setup for Diplom Project

This document describes the CI/CD setup for the Diplom project, which includes multiple microservices: backend API, frontend applications (admin, buyer, seller), and additional services.

## 🚀 Quick Start

### Local Testing
```bash
# Test the entire CI/CD pipeline locally
make test-ci

# Check health of all services
make health-check

# Start all services in production mode
make up-prod

# Start all services in development mode
make up-dev

# Start all services in CI mode (with health checks)
make up-ci
```

## 📁 Project Structure

```
diplom/
├── .github/workflows/          # GitHub Actions workflows
│   ├── ci-cd.yml              # Main CI/CD pipeline
│   └── dev-test.yml           # Development testing
├── backend/                   # Backend services
│   ├── backend/               # Main FastAPI backend
│   └── prosto_board_volume-main/  # Additional backend services
├── frontend/                  # Frontend applications
│   ├── admin/                 # Admin React app
│   ├── buyer/                 # Buyer React app
│   └── seller/                # Seller React app
├── scripts/                   # CI/CD scripts
│   └── test-ci-cd.sh         # Local CI/CD testing script
├── docker-compose.yaml        # Main compose file
├── docker-compose.ci.yml      # CI-specific overrides
├── .env                       # Environment variables
└── Makefile                   # Build automation
```

## 🔄 CI/CD Workflows

### Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Triggers:**
- Push to `main` or `dev` branches
- Pull requests to `main` or `dev` branches
- Manual workflow dispatch

**Jobs:**
1. **test-and-build**: 
   - Builds all Docker containers
   - Starts all services
   - Runs health checks and basic API tests
   - Validates frontend accessibility

2. **deploy**: 
   - Runs only on `main` branch pushes
   - Ready for production deployment configuration

### Development Testing (`.github/workflows/dev-test.yml`)

**Triggers:**
- Push to `dev` branch
- Pull requests to `dev` branch
- Manual workflow dispatch

**Jobs:**
1. **lint-and-test**:
   - Lints backend Python code
   - Tests backend with pytest
   - Builds and tests all frontend applications

2. **dev-integration-test**:
   - Builds and starts services in development mode
   - Runs integration tests

## 🐳 Docker Services

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

## 🛠️ Available Make Commands

### Basic Operations
```bash
make help           # Show all available commands
make up             # Start all services (production mode)
make up-dev         # Start all services (development mode)
make up-ci          # Start all services (CI mode with health checks)
make down           # Stop all services
make ps             # List running containers
make logs           # View logs from all containers
```

### Build Operations
```bash
make build          # Build all services (production mode)
make build-dev      # Build all services (development mode)
make build-ci       # Build all services (CI mode)
make rebuild        # Rebuild and restart all services
make rebuild-dev    # Rebuild and restart (development mode)
make rebuild-ci     # Rebuild and restart (CI mode)
```

### Testing and Health Checks
```bash
make test-ci        # Run complete local CI/CD test
make health-check   # Check health of all running services
```

## 🔧 Configuration

### Environment Variables
Key environment variables in `.env`:

```bash
# Backend
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_PG_HOST=backend-pg
BACKEND_PG_DATABASE=backend

# Frontend
FRONTEND_ADMIN_PORT=8080
FRONTEND_SELLER_PORT=8081
FRONTEND_BUYER_PORT=8082
FRONTEND_ADMIN_API_URL=http://172.27.65.14:8000/
FRONTEND_SELLER_API_URL=http://172.27.65.14:8000/
FRONTEND_BUYER_API_URL=http://172.27.65.14:8000/

# Prosto Board
DETECT_PORT=8002
BACKEND_PORT=8001
```

### CI-Specific Configuration
The `docker-compose.ci.yml` file provides:
- Health checks for all services
- Optimized settings for CI environment
- Temporary storage for databases
- Reduced resource usage

## 🧪 Testing

### Local Testing
Run the complete CI/CD pipeline locally:
```bash
./scripts/test-ci-cd.sh
```

This script:
1. Backs up your current `.env` file
2. Updates API URLs for container networking
3. Builds and starts all services
4. Runs health checks
5. Tests API endpoints
6. Restores original configuration

### Manual Testing
```bash
# Start services
make up-prod

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

The CI/CD pipeline is ready for deployment configuration. To set up deployment:

1. **Configure your deployment target** in `.github/workflows/ci-cd.yml`
2. **Add deployment secrets** to your GitHub repository
3. **Update the deploy job** with your specific deployment commands

Example deployment options:
- Docker registry push
- Kubernetes deployment
- Docker Swarm update
- SSH to production server

## 🔍 Troubleshooting

### Common Issues

1. **Services not starting**: Check logs with `make logs`
2. **Port conflicts**: Ensure ports 8000-8082 are available
3. **Build failures**: Try `make rebuild` to rebuild from scratch
4. **Network issues**: Verify Docker network configuration

### Debug Commands
```bash
# Check container status
docker compose ps

# View specific service logs
docker compose logs backend-api
docker compose logs admin-frontend

# Restart specific service
docker compose restart backend-api

# Rebuild specific service
docker compose build --no-cache backend-api
```

## 📝 Contributing

When contributing to this project:

1. **Test locally** with `make test-ci` before pushing
2. **Check health** with `make health-check` after changes
3. **Update documentation** if adding new services or changing configuration
4. **Follow the existing patterns** for Docker and CI/CD configuration

## 🔗 Useful Links

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/)
