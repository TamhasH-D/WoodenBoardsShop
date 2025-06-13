# Development Environment Setup

This guide explains how to run the Diplom project in development mode with hot reload functionality.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Make (optional, for convenience commands)

### Start Development Environment

```bash
# Start all services in development mode
make dev

# Or use docker compose directly
docker compose -f docker-compose.dev.yaml up -d
```

### Check Status

```bash
# Check all services status
make dev-status

# View logs
make dev-logs

# Or use docker compose directly
docker compose -f docker-compose.dev.yaml logs -f
```

## 📊 Service URLs

Once started, the following services will be available:

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Frontend**: http://localhost:8080
- **Seller Frontend**: http://localhost:8081
- **Buyer Frontend**: http://localhost:8082
- **YOLO Backend**: http://localhost:8001
- **Detection Service**: http://localhost:8002

## 🔄 Hot Reload Features

### Backend (FastAPI)
- **Auto-reload**: Changes to Python files automatically restart the server
- **Debug mode**: Enhanced error messages and logging
- **Volume mounting**: Source code is mounted for real-time changes

### Frontend (React)
- **Fast Refresh**: React components update without losing state
- **Hot Module Replacement**: CSS and JS changes apply instantly
- **Development server**: Webpack dev server with live reload

## 🛠️ Development Commands

### Basic Operations
```bash
# Start development environment
make dev

# Stop development environment
make dev-down

# View logs from all services
make dev-logs

# Check service status
make dev-status

# Rebuild all services
make dev-rebuild
```

### Individual Services
```bash
# Start only backend in development mode
make dev-backend

# Restart specific service
docker compose -f docker-compose.dev.yaml restart <service-name>

# Rebuild specific service
docker compose -f docker-compose.dev.yaml build <service-name>
```

### Service Names
- `api-dev` - Backend API
- `admin-frontend-dev` - Admin Frontend
- `seller-frontend-dev` - Seller Frontend
- `buyer-frontend-dev` - Buyer Frontend
- `backend-pg` - PostgreSQL Database
- `redis` - Redis Cache

## 🔧 Configuration

### Environment Variables
Development settings are configured in `.env` file:

```bash
# Backend settings for development
BACKEND_DEBUG=true
BACKEND_RELOAD=true
BACKEND_LOG_LEVEL=debug

# Frontend settings for development
NODE_ENV=development
```

### Docker Compose Files
- `docker-compose.dev.yaml` - Main development compose file
- `frontend/*/docker-compose.dev.yaml` - Individual frontend services
- `backend/backend/docker-compose.dev.yaml` - Backend service

### Dockerfiles
- `frontend/*/Dockerfile.dev` - Development frontend images
- `backend/backend/Dockerfile.dev` - Development backend image

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 8000-8002, 8080-8082 are available
2. **Docker network**: The `diplom_default` network is created automatically
3. **Volume permissions**: On Windows, ensure Docker has access to the project directory

### Debugging Commands

```bash
# Check container status
docker compose -f docker-compose.dev.yaml ps

# View specific service logs
docker compose -f docker-compose.dev.yaml logs <service-name>

# Execute commands in running container
docker compose -f docker-compose.dev.yaml exec <service-name> bash

# Restart problematic service
docker compose -f docker-compose.dev.yaml restart <service-name>
```

### Reset Environment

```bash
# Stop and remove all containers
make dev-down

# Clean Docker resources
make clean

# Rebuild everything from scratch
make dev-rebuild
```

## 📝 Making Changes

### Backend Changes
1. Edit Python files in `backend/backend/`
2. Server automatically restarts
3. Check logs: `docker compose -f docker-compose.dev.yaml logs api-dev`

### Frontend Changes
1. Edit React files in `frontend/*/src/`
2. Browser automatically refreshes
3. Check logs: `docker compose -f docker-compose.dev.yaml logs <frontend-service>`

### Database Changes
1. Create new migration: `docker compose -f docker-compose.dev.yaml exec api-dev uv run alembic revision --autogenerate -m "description"`
2. Apply migration: `docker compose -f docker-compose.dev.yaml exec api-dev uv run alembic upgrade head`

## 🚦 Production vs Development

| Feature | Development | Production |
|---------|-------------|------------|
| Hot Reload | ✅ Enabled | ❌ Disabled |
| Debug Mode | ✅ Enabled | ❌ Disabled |
| Source Maps | ✅ Enabled | ❌ Disabled |
| Volume Mounting | ✅ Source code | ❌ Built assets only |
| Optimization | ❌ Minimal | ✅ Full optimization |
| Container Size | 🔴 Larger | 🟢 Smaller |

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Project Architecture](docs/ARCHITECTURE.md)
