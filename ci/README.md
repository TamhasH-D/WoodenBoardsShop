# CI/CD Configuration

This directory contains all CI/CD related configuration and scripts for the Diplom project.

## 📁 Structure

```
ci/
├── config/                    # Configuration files
│   ├── .env.ci               # CI environment variables
│   └── docker-compose.ci.yml # CI Docker Compose overrides
├── scripts/                   # Automation scripts
│   ├── test-ci-cd.sh         # Local CI/CD testing
│   └── start-all.sh          # Quick start script
└── README.md                 # This file
```

## 🔧 Configuration Files

### `.env.ci`
Optimized environment variables for CI/CD pipelines:
- Reduced logging levels for performance
- Test database configuration
- Container networking URLs
- Disabled debug modes

### `docker-compose.ci.yml`
CI-specific Docker Compose overrides:
- Health checks for all services
- Temporary storage for databases (tmpfs)
- Optimized resource usage
- CI-specific environment variables

## 🛠️ Scripts

### `test-ci-cd.sh`
Comprehensive local CI/CD testing script that:
1. Backs up current environment
2. Uses CI configuration
3. Builds and starts all services
4. Runs health checks and API tests
5. Restores original configuration

Usage:
```bash
./ci/scripts/test-ci-cd.sh
```

### `start-all.sh`
Quick start script with multiple modes:

```bash
# Production mode (default)
./ci/scripts/start-all.sh

# Development mode
./ci/scripts/start-all.sh --dev

# CI mode with health checks
./ci/scripts/start-all.sh --ci

# Rebuild containers before starting
./ci/scripts/start-all.sh --rebuild

# Help
./ci/scripts/start-all.sh --help
```

## 🚀 Usage

### Local Testing
```bash
# Test the complete CI/CD pipeline locally
make test-ci

# Or run directly
./ci/scripts/test-ci-cd.sh
```

### Quick Start
```bash
# Start all services in different modes
./ci/scripts/start-all.sh --dev     # Development
./ci/scripts/start-all.sh --ci      # CI mode
./ci/scripts/start-all.sh           # Production
```

### CI Mode
```bash
# Build and start in CI mode
make build-ci
make up-ci

# Check health
make health-check
```

## 🔍 Environment Differences

| Setting | Development | Production | CI |
|---------|-------------|------------|-----|
| Debug Mode | True | False | False |
| Log Level | debug | info | warning |
| Database | Local | Production | Test (tmpfs) |
| Frontend URLs | localhost | Domain | Container names |
| Health Checks | Optional | Recommended | Required |

## 📝 Best Practices

1. **Always test locally** before pushing:
   ```bash
   make test-ci
   ```

2. **Use appropriate mode** for your environment:
   - Development: `--dev`
   - Testing: `--ci`
   - Production: default

3. **Check health** after starting services:
   ```bash
   make health-check
   ```

4. **Clean up** after testing:
   ```bash
   make down
   ```

## 🔗 Related Files

- `/.gitlab-ci.yml` - GitLab CI/CD pipeline configuration
- `/Makefile` - Build automation with CI commands
- `/docs/CI-CD.md` - Comprehensive CI/CD documentation
- `/docs/DEPLOYMENT.md` - Deployment guide
