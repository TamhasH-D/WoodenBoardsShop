#!/bin/bash

# init-network.sh - Initialize Docker networks for the wooden boards shop project
# This script creates the necessary Docker networks for microservices communication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if network exists
network_exists() {
    docker network ls --format "{{.Name}}" | grep -q "^$1$"
}

# Function to create network if it doesn't exist
create_network() {
    local network_name="$1"
    local driver="${2:-bridge}"
    
    if network_exists "$network_name"; then
        print_warning "Network '$network_name' already exists"
    else
        print_status "Creating network '$network_name' with driver '$driver'..."
        if docker network create --driver "$driver" "$network_name" >/dev/null 2>&1; then
            print_success "Network '$network_name' created successfully"
        else
            print_error "Failed to create network '$network_name'"
            return 1
        fi
    fi
}

# Main function
main() {
    print_status "Initializing Docker networks for Wooden Boards Shop..."
    
    # Create main project network for inter-service communication
    create_network "diplom_default" "bridge"
    
    # Create backend-specific network
    create_network "backend-network" "bridge"
    
    # Create frontend networks if needed
    create_network "frontend-network" "bridge"
    
    print_success "All Docker networks initialized successfully!"
    
    # Show created networks
    print_status "Current Docker networks:"
    docker network ls --filter "name=diplom" --filter "name=backend" --filter "name=frontend" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
}

# Run main function
main "$@"
