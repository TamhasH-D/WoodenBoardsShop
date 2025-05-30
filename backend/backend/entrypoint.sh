#!/bin/bash

# Backend API Entrypoint Script
# This script runs database migrations before starting the FastAPI application

set -e  # Exit on any error

echo "🚀 Starting Backend API initialization..."

# Function to wait for database to be ready
wait_for_db() {
    echo "⏳ Waiting for PostgreSQL database to be ready..."
    
    # Extract database connection details from environment variables
    DB_HOST=${BACKEND_PG_HOST:-localhost}
    DB_PORT=${BACKEND_PG_PORT:-5432}
    DB_USER=${BACKEND_PG_USER:-backend}
    DB_NAME=${BACKEND_PG_DATABASE:-backend}
    
    # Wait for database to accept connections
    for i in {1..30}; do
        if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
            echo "✅ Database is ready!"
            return 0
        fi
        echo "⏳ Waiting for database... (attempt $i/30)"
        sleep 2
    done
    
    echo "❌ Database is not ready after 60 seconds"
    exit 1
}

# Function to run database migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    
    # Check if we should skip migrations (for tests)
    if [ "$BACKEND_ENV" = "test" ]; then
        echo "⏭️  Skipping migrations in test environment"
        return 0
    fi
    
    # Check if alembic.ini exists
    if [ ! -f "/app/alembic.ini" ]; then
        echo "❌ Alembic configuration not found at /app/alembic.ini"
        exit 1
    fi
    
    # Run migrations with timeout
    timeout 120 python -m alembic upgrade head
    
    if [ $? -eq 0 ]; then
        echo "✅ Database migrations completed successfully"
    else
        echo "❌ Database migrations failed"
        exit 1
    fi
}

# Function to start the application
start_application() {
    echo "🚀 Starting FastAPI application..."
    
    # Start the application with the provided command or default
    if [ $# -eq 0 ]; then
        # Default command
        exec python -m backend
    else
        # Execute the provided command
        exec "$@"
    fi
}

# Main execution flow
main() {
    echo "🔧 Backend API Entrypoint - $(date)"
    echo "📊 Environment: ${BACKEND_ENV:-local}"
    echo "🗄️  Database: ${BACKEND_PG_HOST:-localhost}:${BACKEND_PG_PORT:-5432}/${BACKEND_PG_DATABASE:-backend}"
    
    # Wait for database to be ready
    wait_for_db
    
    # Run database migrations
    run_migrations
    
    # Start the application
    start_application "$@"
}

# Execute main function with all arguments
main "$@"
