# Database Migrations Guide

This document explains how database migrations work in the backend service and how to manage them in different environments.

## 🔄 Automatic Migrations

### Overview
The backend service automatically runs database migrations on startup when:
- `BACKEND_AUTO_MIGRATE=true` (default)
- Environment is not "test" (`BACKEND_ENV != "test"`)

### Configuration
```bash
# Enable automatic migrations (default)
BACKEND_AUTO_MIGRATE=true

# Disable automatic migrations
BACKEND_AUTO_MIGRATE=false
```

### How It Works
1. **Application Startup**: When the FastAPI app starts, it calls `setup_db()`
2. **Migration Check**: If auto-migrate is enabled and not in test mode, runs `alembic upgrade head`
3. **Database Setup**: Creates database engine and session factory
4. **Ready to Serve**: Application starts serving requests

## 🛠️ Manual Migration Commands

### Development Commands
```bash
# Generate a new migration
make mig-gen name="add_user_table"

# Apply all pending migrations
make mig-head

# Apply next migration
make mig-up

# Rollback last migration
make mig-down

# Show migration history
make mig-history

# Show current migration
make mig-current
```

### Direct Alembic Commands
```bash
# From backend/backend directory
cd backend/backend

# Generate migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Show current version
alembic current

# Show history
alembic history
```

## 🌍 Environment-Specific Behavior

### Development Environment
- **Auto-migrate**: ✅ Enabled by default
- **Behavior**: Migrations run automatically on container start
- **Benefits**: No manual intervention needed, always up-to-date schema

### CI/CD Environment
- **Auto-migrate**: ✅ Enabled by default
- **Behavior**: Migrations run before tests and deployment
- **Benefits**: Ensures clean database state for testing

### Production Environment
- **Auto-migrate**: ✅ Enabled by default (recommended)
- **Alternative**: Can be disabled for manual control
- **Benefits**: Zero-downtime deployments with automatic schema updates

### Test Environment
- **Auto-migrate**: ❌ Disabled automatically
- **Behavior**: Tests manage their own database state
- **Benefits**: Faster test execution, isolated test databases

## 🔧 Migration Best Practices

### Creating Migrations
1. **Always review generated migrations** before applying
2. **Use descriptive names** for migration files
3. **Test migrations** in development before production
4. **Backup database** before applying in production

### Migration Safety
```python
# Good: Safe operations
- Adding new columns with defaults
- Adding new tables
- Adding indexes (with CONCURRENTLY in production)
- Adding constraints that don't conflict

# Caution: Potentially unsafe operations
- Dropping columns (data loss)
- Renaming columns (breaking changes)
- Changing column types (data conversion)
- Adding NOT NULL constraints to existing columns
```

### Production Considerations
1. **Backup First**: Always backup before migrations
2. **Test Rollback**: Ensure rollback procedures work
3. **Monitor Performance**: Large migrations may impact performance
4. **Gradual Rollout**: Consider blue-green deployments for major changes

## 🚨 Troubleshooting

### Common Issues

#### Migration Fails on Startup
```bash
# Check migration status
docker exec -it backend-api alembic current

# Check migration history
docker exec -it backend-api alembic history

# Manually run migrations
docker exec -it backend-api alembic upgrade head
```

#### Database Schema Out of Sync
```bash
# Reset to specific revision
docker exec -it backend-api alembic downgrade <revision>

# Re-apply migrations
docker exec -it backend-api alembic upgrade head
```

#### Migration Timeout
- Default timeout: 60 seconds
- For large migrations, consider manual application
- Monitor database locks and performance

### Disabling Auto-Migrate
If you need manual control over migrations:

```bash
# In .env file
BACKEND_AUTO_MIGRATE=false
```

Then run migrations manually:
```bash
make mig-head
# or
docker exec -it backend-api alembic upgrade head
```

## 📊 Migration Monitoring

### Logs
Auto-migrations produce detailed logs:
```
🔄 Running database migrations...
✅ Database migrations completed successfully
```

### Error Handling
Failed migrations are logged with full error details:
```
❌ Migration failed with return code 1
Migration error: [detailed error message]
```

## 🔄 CI/CD Integration

### GitLab CI Pipeline
Migrations run automatically in CI/CD:
1. **Build Stage**: Container built with migration code
2. **Test Stage**: Fresh database with migrations applied
3. **Deploy Stage**: Production deployment with auto-migrations

### Health Checks
The application includes database connectivity checks to ensure migrations completed successfully before serving traffic.

## 📝 Migration Workflow

### Development Workflow
1. **Make Model Changes**: Update SQLAlchemy models
2. **Generate Migration**: `make mig-gen name="description"`
3. **Review Migration**: Check generated SQL in migration file
4. **Test Migration**: Restart container (auto-migrate applies it)
5. **Commit Changes**: Include both model and migration files

### Production Deployment
1. **Code Deploy**: New container with migration code
2. **Auto-Migration**: Migrations run on container startup
3. **Health Check**: Application verifies database connectivity
4. **Traffic Routing**: Load balancer routes to new containers

This approach ensures database schema is always in sync with application code across all environments.
