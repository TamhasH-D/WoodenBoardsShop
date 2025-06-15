#!/bin/bash

# Keycloak automatic setup script
# This script configures Keycloak realms, clients, and test users

set -e

# Configuration
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin"
REALMS=("AdminRealm" "BuyerRealm" "SellerRealm")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# HTTP request function that works with curl, wget, or bash
http_get() {
    local url=$1
    if command -v curl >/dev/null 2>&1; then
        curl -s -f "$url" 2>/dev/null
    elif command -v wget >/dev/null 2>&1; then
        wget -q -O - "$url" 2>/dev/null
    else
        # Fallback using bash and /dev/tcp
        local host=$(echo "$url" | sed 's|http://||' | cut -d'/' -f1 | cut -d':' -f1)
        local port=$(echo "$url" | sed 's|http://||' | cut -d'/' -f1 | cut -d':' -f2)
        local path=$(echo "$url" | sed 's|http://[^/]*||')

        if [ "$port" = "$host" ]; then
            port=80
        fi

        exec 3<>/dev/tcp/$host/$port 2>/dev/null || return 1
        echo -e "GET $path HTTP/1.1\r\nHost: $host\r\nConnection: close\r\n\r\n" >&3
        cat <&3 2>/dev/null
        exec 3<&-
    fi
}

# HTTP POST function
http_post() {
    local url=$1
    local data=$2
    local content_type=$3

    if command -v curl >/dev/null 2>&1; then
        curl -s -X POST "$url" -H "Content-Type: $content_type" -d "$data" 2>/dev/null
    elif command -v wget >/dev/null 2>&1; then
        wget -q -O - --post-data="$data" --header="Content-Type: $content_type" "$url" 2>/dev/null
    else
        error "No HTTP client available for POST requests"
        return 1
    fi
}

# HTTP POST with authorization
http_post_auth() {
    local url=$1
    local data=$2
    local content_type=$3
    local token=$4

    if command -v curl >/dev/null 2>&1; then
        # Use temporary file to capture both response and status code
        local temp_file=$(mktemp)
        local http_code=$(curl -s -w "%{http_code}" -X POST "$url" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: $content_type" \
            -d "$data" \
            -o "$temp_file" 2>/dev/null)

        # Output response body and then status code
        cat "$temp_file" 2>/dev/null
        rm -f "$temp_file"
        echo "$http_code"
    elif command -v wget >/dev/null 2>&1; then
        wget -q -O - --post-data="$data" \
            --header="Authorization: Bearer $token" \
            --header="Content-Type: $content_type" \
            "$url" 2>/dev/null
        echo "201"  # Assume success for wget
    else
        error "No HTTP client available for authenticated POST requests"
        return 1
    fi
}

# Wait for Keycloak to be ready
wait_for_keycloak() {
    log "Waiting for Keycloak to be ready..."
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        # Try health endpoint first
        if http_get "$KEYCLOAK_URL/health/ready" >/dev/null 2>&1; then
            log "Keycloak is ready!"
            return 0
        fi

        # Fallback: try to get master realm info
        if http_get "$KEYCLOAK_URL/realms/master" >/dev/null 2>&1; then
            log "Keycloak is ready (via master realm check)!"
            return 0
        fi

        log "Attempt $attempt/$max_attempts - Keycloak not ready yet, waiting..."
        sleep 10
        ((attempt++))
    done

    error "Keycloak failed to become ready after $max_attempts attempts"
    return 1
}

# Get admin access token
get_admin_token() {
    log "Getting admin access token..."

    local data="grant_type=password&client_id=admin-cli&username=$ADMIN_USERNAME&password=$ADMIN_PASSWORD"
    local response=$(http_post "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" "$data" "application/x-www-form-urlencoded")

    if [ $? -ne 0 ] || [ -z "$response" ]; then
        error "Failed to get admin token"
        return 1
    fi

    echo "$response" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4
}

# Create realm
create_realm() {
    local realm_name=$1
    local token=$2

    log "Creating realm: $realm_name"

    local realm_config='{
        "realm": "'$realm_name'",
        "enabled": true,
        "registrationAllowed": true,
        "verifyEmail": true,
        "resetPasswordAllowed": true,
        "loginWithEmailAllowed": true,
        "duplicateEmailsAllowed": false,
        "registrationEmailAsUsername": true,
        "smtpServer": {
            "host": "smtp.gmail.com",
            "port": "587",
            "from": "eugenenag@gmail.com",
            "auth": "true",
            "user": "eugenenag@gmail.com",
            "password": "nnce xyhu ydsq vqxu",
            "starttls": "true",
            "ssl": "false"
        }
    }'

    local response=$(http_post_auth "$KEYCLOAK_URL/admin/realms" "$realm_config" "application/json" "$token")
    local http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "201" ]; then
        log "Realm '$realm_name' created successfully"
        return 0
    elif [ "$http_code" = "409" ]; then
        warn "Realm '$realm_name' already exists"
        return 0
    else
        error "Failed to create realm '$realm_name' (HTTP $http_code)"
        log "Response: $(echo "$response" | head -n -1)"
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
    
    local response=$(http_post_auth "$KEYCLOAK_URL/admin/realms/$realm_name/clients" "$client_config" "application/json" "$token")
    local http_code=$(echo "$response" | tail -n1)
    
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
    
    local response=$(http_post_auth "$KEYCLOAK_URL/admin/realms/$realm_name/users" "$user_config" "application/json" "$token")
    local http_code=$(echo "$response" | tail -n1)
    
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
    local token=$(get_admin_token)
    if [ -z "$token" ]; then
        error "Failed to get admin token"
        exit 1
    fi
    
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
    log "  Admin Console: http://localhost:8030/admin"
    log "  Admin credentials: $ADMIN_USERNAME / $ADMIN_PASSWORD"
    log ""
    log "Test users created:"
    log "  AdminRealm: admin@test.com / admin123"
    log "  BuyerRealm: buyer@test.com / buyer123"
    log "  SellerRealm: seller@test.com / seller123"
    log ""
    log "Realm URLs:"
    log "  AdminRealm: http://localhost:8030/realms/AdminRealm"
    log "  BuyerRealm: http://localhost:8030/realms/BuyerRealm"
    log "  SellerRealm: http://localhost:8030/realms/SellerRealm"
}

# Run main function
main "$@"
