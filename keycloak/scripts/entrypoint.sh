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
    log "Starting Keycloak universal setup in background..."
    # Ensure the setup script is executable
    chmod +x /opt/keycloak/scripts/setup-universal.sh
    /opt/keycloak/scripts/setup-universal.sh &
    local setup_pid=$!
    log "Setup process started with PID: $setup_pid"
}

# Start Keycloak in background
log "Starting Keycloak server..."
/opt/keycloak/bin/kc.sh start &
KEYCLOAK_PID=$!

log "Keycloak started with PID: $KEYCLOAK_PID"

# Wait a bit for Keycloak to start before running setup
log "Waiting 30 seconds for Keycloak to fully start..."
sleep 30

# Run the setup script unconditionally
log "Attempting to run Keycloak setup script..."
run_setup

# Wait for Keycloak process to exit
log "Keycloak entrypoint script finished. Waiting for Keycloak process (PID: $KEYCLOAK_PID) to terminate."
wait $KEYCLOAK_PID
log "Keycloak process has terminated. Exiting entrypoint."
