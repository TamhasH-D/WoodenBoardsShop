#!/bin/bash

# Keycloak entrypoint script
# This script starts Keycloak and then configures it automatically

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[ENTRYPOINT] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[ENTRYPOINT] $1${NC}"
}

# Function to run setup in background
run_setup() {
    log "Starting Keycloak setup in background..."
    /opt/keycloak/scripts/setup-keycloak.sh &
    local setup_pid=$!
    log "Setup process started with PID: $setup_pid"
}

# Check if this is the first run
if [ ! -f "/opt/keycloak/data/.setup_completed" ]; then
    log "First run detected - will configure Keycloak after startup"
    FIRST_RUN=true
else
    log "Keycloak already configured - skipping setup"
    FIRST_RUN=false
fi

# Start Keycloak in background
log "Starting Keycloak server..."
/opt/keycloak/bin/kc.sh start &
KEYCLOAK_PID=$!

log "Keycloak started with PID: $KEYCLOAK_PID"

# If first run, start setup process
if [ "$FIRST_RUN" = true ]; then
    # Wait a bit for Keycloak to start
    log "Waiting 30 seconds for Keycloak to fully start..."
    sleep 30
    run_setup

    # Create marker file to indicate setup was attempted
    mkdir -p /opt/keycloak/data
    touch /opt/keycloak/data/.setup_completed
fi

# Wait for Keycloak process
wait $KEYCLOAK_PID
