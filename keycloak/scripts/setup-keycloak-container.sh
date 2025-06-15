#!/bin/bash

# Keycloak automatic setup script for container environment
# This script configures Keycloak with realms, clients, and test users using curl

# Note: Removed set -e to allow proper error handling

# Configuration
KEYCLOAK_URL="${KEYCLOAK_URL:-http://keycloak:8080}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
REALMS=("AdminRealm" "BuyerRealm" "SellerRealm")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Wait for Keycloak to be ready
wait_for_keycloak() {
    log "Waiting for Keycloak to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$KEYCLOAK_URL/realms/master" >/dev/null 2>&1; then
            log "Keycloak is ready!"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts - Keycloak not ready yet, waiting..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    error "Keycloak failed to become ready after $max_attempts attempts"
    return 1
}

# Get admin access token
get_admin_token() {
    log "Getting admin access token..." >&2
    
    local response
    response=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "grant_type=password" \
        -d "client_id=admin-cli" \
        -d "username=$ADMIN_USERNAME" \
        -d "password=$ADMIN_PASSWORD" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        log "Token response length: ${#response}" >&2
        log "First 100 chars: ${response:0:100}..." >&2
        local token
        token=$(echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$token" ]; then
            echo "$token"
        else
            error "Failed to extract token from response" >&2
            log "Full response: $response" >&2
            return 1
        fi
    else
        error "Failed to get admin token" >&2
        log "Response: $response" >&2
        return 1
    fi
}

# Create realm
create_realm() {
    local realm_name=$1
    local token=$2

    log "Creating realm: $realm_name"

    # Check if realm already exists
    log "Checking if realm '$realm_name' already exists..."
    local existing_realms
    existing_realms=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" 2>/dev/null)

    log "Realms response length: ${#existing_realms}"
    log "First 100 chars: ${existing_realms:0:100}..."

    if echo "$existing_realms" | grep -q "\"realm\":\"$realm_name\""; then
        warn "Realm '$realm_name' already exists"
        return 0
    fi

    log "Realm '$realm_name' does not exist, creating..."
    
    local realm_config='{
        "realm": "'$realm_name'",
        "enabled": true,
        "registrationAllowed": true,
        "verifyEmail": false,
        "resetPasswordAllowed": true,
        "loginWithEmailAllowed": true,
        "duplicateEmailsAllowed": false,
        "registrationEmailAsUsername": true
    }'
    
    local temp_file=$(mktemp)
    local http_code
    http_code=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$realm_config" \
        -o "$temp_file" 2>/dev/null)

    local response_body=""
    if [ -f "$temp_file" ]; then
        response_body=$(cat "$temp_file" 2>/dev/null || echo "")
        rm -f "$temp_file"
    fi
    
    if [ "$http_code" = "201" ]; then
        log "Realm '$realm_name' created successfully"
        return 0
    elif [ "$http_code" = "409" ]; then
        warn "Realm '$realm_name' already exists"
        return 0
    elif [ "$http_code" = "400" ] && echo "$response_body" | grep -q "already exists"; then
        warn "Realm '$realm_name' already exists (detected from error message)"
        return 0
    else
        error "Failed to create realm '$realm_name' (HTTP $http_code)"
        log "Response body: $response_body"
        return 1
    fi
}

# Create client
create_client() {
    local realm_name=$1
    local client_id=$2
    local redirect_uris=$3
    local token=$4
    
    log "Creating client '$client_id' in realm '$realm_name'"
    
    local client_config='{
        "clientId": "'$client_id'",
        "enabled": true,
        "publicClient": true,
        "redirectUris": ['$redirect_uris'],
        "webOrigins": ["*"],
        "protocol": "openid-connect",
        "standardFlowEnabled": true,
        "implicitFlowEnabled": false,
        "directAccessGrantsEnabled": true
    }'
    
    local temp_file=$(mktemp)
    local http_code
    http_code=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms/$realm_name/clients" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$client_config" \
        -o "$temp_file" 2>/dev/null)

    local response_body=""
    if [ -f "$temp_file" ]; then
        response_body=$(cat "$temp_file" 2>/dev/null || echo "")
        rm -f "$temp_file"
    fi
    
    if [ "$http_code" = "201" ]; then
        log "Client '$client_id' created successfully in realm '$realm_name'"
        return 0
    elif [ "$http_code" = "409" ]; then
        warn "Client '$client_id' already exists in realm '$realm_name'"
        return 0
    else
        error "Failed to create client '$client_id' in realm '$realm_name' (HTTP $http_code)"
        return 1
    fi
}

# Create test user
create_test_user() {
    local realm_name=$1
    local username=$2
    local email=$3
    local password=$4
    local token=$5
    
    log "Creating test user '$username' in realm '$realm_name'"
    
    local user_config='{
        "username": "'$username'",
        "email": "'$email'",
        "enabled": true,
        "emailVerified": true,
        "firstName": "Test",
        "lastName": "User",
        "credentials": [{
            "type": "password",
            "value": "'$password'",
            "temporary": false
        }]
    }'
    
    local temp_file=$(mktemp)
    local http_code
    http_code=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms/$realm_name/users" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$user_config" \
        -o "$temp_file" 2>/dev/null)

    local response_body=""
    if [ -f "$temp_file" ]; then
        response_body=$(cat "$temp_file" 2>/dev/null || echo "")
        rm -f "$temp_file"
    fi
    
    if [ "$http_code" = "201" ]; then
        log "Test user '$username' created successfully in realm '$realm_name'"
        return 0
    elif [ "$http_code" = "409" ]; then
        warn "Test user '$username' already exists in realm '$realm_name'"
        return 0
    else
        error "Failed to create test user '$username' in realm '$realm_name' (HTTP $http_code)"
        return 1
    fi
}

# Main execution
main() {
    log "Starting Keycloak automatic setup..."
    
    # Wait for Keycloak to be ready
    if ! wait_for_keycloak; then
        error "Keycloak setup failed - service not ready"
        exit 1
    fi
    
    # Get admin token
    local token
    token=$(get_admin_token)
    if [ -z "$token" ]; then
        error "Failed to get admin token"
        exit 1
    fi
    log "Admin token acquired successfully: ${token:0:50}..."
    
    # Create realms and configure them
    for realm in "${REALMS[@]}"; do
        if create_realm "$realm" "$token"; then
            case "$realm" in
                "AdminRealm")
                    create_client "$realm" "admin-frontend" '"http://localhost:8080/*"' "$token"
                    create_test_user "$realm" "admin@test.com" "admin@test.com" "admin123" "$token"
                    ;;
                "BuyerRealm")
                    create_client "$realm" "buyer-frontend" '"http://localhost:8082/*"' "$token"
                    create_test_user "$realm" "buyer@test.com" "buyer@test.com" "buyer123" "$token"
                    ;;
                "SellerRealm")
                    create_client "$realm" "seller-frontend" '"http://localhost:8081/*"' "$token"
                    create_test_user "$realm" "seller@test.com" "seller@test.com" "seller123" "$token"
                    ;;
            esac
        fi
    done
    
    log "Keycloak setup completed successfully!"
    log ""
    log "Access URLs:"
    log "  Admin Console: $KEYCLOAK_URL/admin"
    log "  Admin credentials: $ADMIN_USERNAME / $ADMIN_PASSWORD"
    log ""
    log "Test users created:"
    log "  AdminRealm: admin@test.com / admin123"
    log "  BuyerRealm: buyer@test.com / buyer123"
    log "  SellerRealm: seller@test.com / seller123"
    log ""
    log "Realm URLs:"
    log "  AdminRealm: $KEYCLOAK_URL/realms/AdminRealm"
    log "  BuyerRealm: $KEYCLOAK_URL/realms/BuyerRealm"
    log "  SellerRealm: $KEYCLOAK_URL/realms/SellerRealm"
}

# Run main function
main "$@"
