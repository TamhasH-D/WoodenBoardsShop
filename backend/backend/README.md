# Backend Service

Main backend API service for the Diplom project wood products marketplace.

## 🚀 Quick Start

### Development Mode (with file watching)
```bash
make up-dev
```

### Production Mode
```bash
make up
```

## 📁 Docker Compose Files

### `docker-compose.yaml`
Main Docker Compose configuration for production and CI/CD environments.

### `docker-compose.dev.yaml`
Development override file that adds:
- File watching with automatic reload
- Debug mode enabled
- Verbose logging

## 🔧 Available Commands

```bash
# Development
make run              # Run application locally
make up               # Start with Docker (production mode)
make up-dev           # Start with Docker (development mode with file watching)
make down             # Stop Docker containers
make build            # Build Docker images
make rebuild          # Rebuild and restart

# Testing
make test             # Run all tests
make test-filter      # Run tests with filter: make test-filter filter="test_name"
make test-coverage    # Run tests with coverage

# Database
make mig-gen          # Generate migration: make mig-gen name="migration_name"
make mig-head         # Apply all migrations
make mig-up           # Apply next migration
make mig-down         # Rollback last migration

# Code Quality
make lint             # Run linters and formatters
make logs             # View container logs
```

## 🔧 Configuration

### Environment Files
- `.env` - Main configuration (not tracked in git)
- `.env.example` - Template with all available options

### Development vs Production

**Development Mode (`make up-dev`):**
- Uses both `docker-compose.yaml` and `docker-compose.dev.yaml`
- Enables file watching for automatic reload
- Debug mode and verbose logging enabled
- Suitable for local development

**Production Mode (`make up`):**
- Uses only `docker-compose.yaml`
- Optimized for performance and stability
- Suitable for production and CI/CD

## 🐳 Docker Compose Watch

The development mode uses Docker Compose's `watch` feature for automatic file synchronization:

- **Sync**: `./backend` and `./tests` directories are synchronized with the container
- **Rebuild**: Container rebuilds when `pyproject.toml` or `uv.lock` changes

## 🔍 Health Checks

The service includes health checks for:
- **PostgreSQL**: `pg_isready` command
- **Redis**: `redis-cli ping` command

## 🌐 API Documentation

When running, API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test
make test-filter filter="test_users"

# Run with coverage
make test-coverage
```

## 📊 Database Migrations

```bash
# Generate new migration
make mig-gen name="add_user_table"

# Apply migrations
make mig-head

# Rollback last migration
make mig-down
```

## 🔧 Development Workflow

1. **Setup**: Copy `.env.example` to `.env` and configure
2. **Start**: Run `make up-dev` for development with file watching
3. **Code**: Edit files - changes will be automatically synchronized
4. **Test**: Run `make test` to verify changes
5. **Migrate**: Use `make mig-gen` and `make mig-head` for database changes

## 🚀 Deployment

For production deployment, use:
```bash
make up
```

This uses the production-optimized configuration without development features.

## 📝 Notes

- The `develop.watch` feature requires Docker Compose v2.22+
- For CI/CD environments, only `docker-compose.yaml` is used
- File watching is only available in development mode