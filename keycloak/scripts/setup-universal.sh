#!/bin/bash

# Universal Keycloak Setup Script with Maximum Wildcards
# This script configures Keycloak with universal wildcards to work with any address

set -e

# Configuration from environment variables
KEYCLOAK_URL="${KEYCLOAK_URL:-http://keycloak:8080}"
ADMIN_USERNAME="${KEYCLOAK_ADMIN:-admin}"
ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"

# Logging functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

warn() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1" >&2
}

# Wait for Keycloak to be ready
wait_for_keycloak() {
    log "Waiting for Keycloak to be ready..."
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$KEYCLOAK_URL/health/ready" >/dev/null 2>&1; then
            log "Keycloak is ready!"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts - Keycloak not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    error "Keycloak failed to become ready after $max_attempts attempts"
    return 1
}

# Get admin access token
get_admin_token() {
    log "Getting admin access token..."
    
    local response
    response=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=$ADMIN_USERNAME" \
        -d "password=$ADMIN_PASSWORD" \
        -d "grant_type=password" \
        -d "client_id=admin-cli" 2>/dev/null)
    
    if [ $? -ne 0 ] || [ -z "$response" ]; then
        error "Failed to get admin token"
        return 1
    fi
    
    local token
    token=$(echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        error "Failed to extract token from response"
        return 1
    fi
    
    echo "$token"
}

# Create realm
create_realm() {
    local realm_name=$1
    local token=$2
    
    log "Creating realm: $realm_name"
    
    # Check if realm already exists
    local existing_realms
    existing_realms=$(curl -s -H "Authorization: Bearer $token" \
        "$KEYCLOAK_URL/admin/realms" 2>/dev/null)
    
    if echo "$existing_realms" | grep -q "\"realm\":\"$realm_name\""; then
        warn "Realm '$realm_name' already exists, skipping creation"
        return 0
    fi
    
    # Create realm with universal settings
    local realm_config='{
        "realm": "'$realm_name'",
        "enabled": true,
        "registrationAllowed": false,
        "loginWithEmailAllowed": true,
        "duplicateEmailsAllowed": false,
        "resetPasswordAllowed": true,
        "editUsernameAllowed": false,
        "bruteForceProtected": true,
        "sslRequired": "none",
        "accessTokenLifespan": 300,
        "accessTokenLifespanForImplicitFlow": 900,
        "ssoSessionIdleTimeout": 1800,
        "ssoSessionMaxLifespan": 36000,
        "offlineSessionIdleTimeout": 2592000,
        "accessCodeLifespan": 60,
        "accessCodeLifespanUserAction": 300,
        "accessCodeLifespanLogin": 1800,
        "actionTokenGeneratedByAdminLifespan": 43200,
        "actionTokenGeneratedByUserLifespan": 300
    }'
    
    local http_code
    http_code=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$realm_config" \
        -o /dev/null 2>/dev/null)
    
    if [ "$http_code" = "201" ]; then
        log "Realm '$realm_name' created successfully"
        return 0
    else
        error "Failed to create realm '$realm_name' (HTTP $http_code)"
        return 1
    fi
}

# Create client with maximum wildcards for universal compatibility
create_universal_client() {
    local realm_name=$1
    local client_id=$2
    local token=$3

    log "Creating UNIVERSAL client '$client_id' in realm '$realm_name' with MAXIMUM wildcards"

    # Check if client already exists and delete it
    local existing_client_id
    existing_client_id=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$realm_name/clients" \
        -H "Authorization: Bearer $token" 2>/dev/null | \
        grep -o "\"id\":\"[^\"]*\"[^}]*\"clientId\":\"$client_id\"" | \
        grep -o "\"id\":\"[^\"]*\"" | cut -d'"' -f4)

    if [ -n "$existing_client_id" ]; then
        log "Deleting existing client '$client_id' (ID: $existing_client_id)"
        curl -s -X DELETE "$KEYCLOAK_URL/admin/realms/$realm_name/clients/$existing_client_id" \
            -H "Authorization: Bearer $token" >/dev/null 2>&1
    fi

    # Universal client configuration with MAXIMUM wildcards for ANY address
    local client_config='{
        "clientId": "'$client_id'",
        "enabled": true,
        "publicClient": true,
        "redirectUris": ["*"],
        "webOrigins": ["*"],
        "protocol": "openid-connect",
        "standardFlowEnabled": true,
        "implicitFlowEnabled": false,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": false,
        "authorizationServicesEnabled": false,
        "fullScopeAllowed": true,
        "attributes": {
            "post.logout.redirect.uris": "*",
            "pkce.code.challenge.method": "S256",
            "access.token.lifespan": "300",
            "client.session.idle.timeout": "1800",
            "client.session.max.lifespan": "36000"
        }
    }'
    
    local http_code
    http_code=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms/$realm_name/clients" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$client_config" \
        -o /dev/null 2>/dev/null)
    
    if [ "$http_code" = "201" ]; then
        log "Universal client '$client_id' created successfully"
        return 0
    elif [ "$http_code" = "409" ]; then
        warn "Client '$client_id' already exists, skipping"
        return 0
    else
        error "Failed to create client '$client_id' (HTTP $http_code)"
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
    
    local http_code
    http_code=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms/$realm_name/users" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$user_config" \
        -o /dev/null 2>/dev/null)
    
    if [ "$http_code" = "201" ]; then
        log "Test user '$username' created successfully"
        return 0
    elif [ "$http_code" = "409" ]; then
        warn "User '$username' already exists, skipping"
        return 0
    else
        error "Failed to create user '$username' (HTTP $http_code)"
        return 1
    fi
}

# Main execution
main() {
    log "🚀 Starting Universal Keycloak Setup with Maximum Wildcards..."
    log "🌐 Keycloak URL: $KEYCLOAK_URL"
    log "👤 Admin User: $ADMIN_USERNAME"
    
    # Wait for Keycloak
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
    log "✅ Admin token acquired successfully"
    
    # Create realms and configure them
    local realms=("AdminRealm" "BuyerRealm" "SellerRealm")
    
    for realm in "${realms[@]}"; do
        if create_realm "$realm" "$token"; then
            case "$realm" in
                "AdminRealm")
                    create_universal_client "$realm" "admin-frontend" "$token"
                    create_test_user "$realm" "admin@test.com" "admin@test.com" "admin123" "$token"
                    ;;
                "BuyerRealm")
                    create_universal_client "$realm" "buyer-frontend" "$token"
                    create_test_user "$realm" "buyer@test.com" "buyer@test.com" "buyer123" "$token"
                    ;;
                "SellerRealm")
                    create_universal_client "$realm" "seller-frontend" "$token"
                    create_test_user "$realm" "seller@test.com" "seller@test.com" "seller123" "$token"
                    ;;
            esac
        fi
    done
    
    log ""
    log "🎉 Universal Keycloak Setup Completed Successfully!"
    log ""
    log "🌐 Access URLs:"
    log "   Admin Console: $KEYCLOAK_URL/admin"
    log "   Admin credentials: $ADMIN_USERNAME / $ADMIN_PASSWORD"
    log ""
    log "👥 Test users created:"
    log "   AdminRealm: admin@test.com / admin123"
    log "   BuyerRealm: buyer@test.com / buyer123"
    log "   SellerRealm: seller@test.com / seller123"
    log ""
    log "🔗 Realm URLs:"
    log "   AdminRealm: $KEYCLOAK_URL/realms/AdminRealm"
    log "   BuyerRealm: $KEYCLOAK_URL/realms/BuyerRealm"
    log "   SellerRealm: $KEYCLOAK_URL/realms/SellerRealm"
    log ""
    log "⭐ All clients configured with universal wildcards (*)"
    log "   This means they will work with ANY domain/IP/port combination!"
}

# Run main function
main "$@"
