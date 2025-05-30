# CI/CD Configuration

This directory contains CI/CD configuration files for the Diplom project.

## 📁 Structure

```
ci/
├── config/                    # Configuration files
│   ├── .env.ci               # CI environment variables
│   └── docker-compose.ci.yml # CI Docker Compose overrides
├── scripts/                   # Automation scripts
│   └── test-pipeline-locally.sh # Local pipeline testing
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
- Optimized resource usage
- CI-specific environment variables

## 🛠️ Scripts

### `test-pipeline-locally.sh`
Comprehensive local CI/CD testing script that simulates the GitLab pipeline:
1. Builds all Docker containers
2. Starts services with automatic migrations
3. Runs health checks and API tests
4. Provides detailed logging and error reporting
5. Cleans up resources after testing

Usage:
```bash
# Run via Makefile (recommended)
make test

# Or run directly
./ci/scripts/test-pipeline-locally.sh
```

## 🚀 Usage

### Local Testing
```bash
# Test the complete CI/CD pipeline locally
make test

# Start backend services for development
make dev

# Check service health
make health
```

### CI/CD Pipeline
The GitLab CI/CD pipeline automatically uses these configurations:
- `.env.ci` for environment variables
- `docker-compose.ci.yml` for service overrides

## 🔍 Environment Differences

| Setting | Development | Production | CI |
|---------|-------------|------------|-----|
| Debug Mode | True | False | False |
| Log Level | debug | info | warning |
| Database | Local | Production | Test |
| Health Checks | Optional | Recommended | Required |

## 📝 Best Practices

1. **Test locally** before pushing:
   ```bash
   make test
   ```

2. **Check health** after starting services:
   ```bash
   make health
   ```

3. **Clean up** after testing:
   ```bash
   make clean-all
   ```

## 🔗 Related Files

- `/.gitlab-ci.yml` - GitLab CI/CD pipeline configuration
- `/Makefile` - Build automation commands
- `/ci/scripts/test-pipeline-locally.sh` - Local pipeline testing
