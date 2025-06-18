#!/bin/bash

# Universal Keycloak Setup Script with Maximum Wildcards
# This script configures Keycloak with universal wildcards to work with any address

set -e

# Configuration from environment variables
KEYCLOAK_URL="${KEYCLOAK_URL:-http://keycloak:8080}"
# KEYCLOAK_ADMIN and KEYCLOAK_ADMIN_PASSWORD are used directly by get_admin_token

# Realm, Client, and User configurations with defaults
REALM_ADMIN_NAME="${KEYCLOAK_REALM_ADMIN_NAME:-AdminRealm}"
CLIENT_ADMIN_ID="${KEYCLOAK_CLIENT_ADMIN_ID:-admin-frontend}"
CLIENT_ADMIN_REDIRECT_URIS="${KEYCLOAK_CLIENT_ADMIN_REDIRECT_URIS:-http://localhost:8080/*,https://admin.taruman.ru/*}"
CLIENT_ADMIN_WEB_ORIGINS="${KEYCLOAK_CLIENT_ADMIN_WEB_ORIGINS:-+}"
USER_ADMIN_USERNAME="${KEYCLOAK_USER_ADMIN_USERNAME:-admin@test.com}"
USER_ADMIN_EMAIL="${KEYCLOAK_USER_ADMIN_EMAIL:-admin@test.com}"
USER_ADMIN_PASSWORD="${KEYCLOAK_USER_ADMIN_PASSWORD:-admin123}"

REALM_BUYER_NAME="${KEYCLOAK_REALM_BUYER_NAME:-BuyerRealm}"
CLIENT_BUYER_ID="${KEYCLOAK_CLIENT_BUYER_ID:-buyer-frontend}"
CLIENT_BUYER_REDIRECT_URIS="${KEYCLOAK_CLIENT_BUYER_REDIRECT_URIS:-http://localhost:3000/*,https://buyer.taruman.ru/*}"
CLIENT_BUYER_WEB_ORIGINS="${KEYCLOAK_CLIENT_BUYER_WEB_ORIGINS:-+}"
USER_BUYER_USERNAME="${KEYCLOAK_USER_BUYER_USERNAME:-buyer@test.com}"
USER_BUYER_EMAIL="${KEYCLOAK_USER_BUYER_EMAIL:-buyer@test.com}"
USER_BUYER_PASSWORD="${KEYCLOAK_USER_BUYER_PASSWORD:-buyer123}"

REALM_SELLER_NAME="${KEYCLOAK_REALM_SELLER_NAME:-SellerRealm}"
CLIENT_SELLER_ID="${KEYCLOAK_CLIENT_SELLER_ID:-seller-frontend}"
CLIENT_SELLER_REDIRECT_URIS="${KEYCLOAK_CLIENT_SELLER_REDIRECT_URIS:-http://localhost:3001/*,https://seller.taruman.ru/*}"
CLIENT_SELLER_WEB_ORIGINS="${KEYCLOAK_CLIENT_SELLER_WEB_ORIGINS:-+}"
USER_SELLER_USERNAME="${KEYCLOAK_USER_SELLER_USERNAME:-seller@test.com}"
USER_SELLER_EMAIL="${KEYCLOAK_USER_SELLER_EMAIL:-seller@test.com}"
USER_SELLER_PASSWORD="${KEYCLOAK_USER_SELLER_PASSWORD:-seller123}"


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
        -d "username=${KC_BOOTSTRAP_ADMIN_USERNAME:-admin}" \
        -d "password=${KC_BOOTSTRAP_ADMIN_PASSWORD:-admin_password}" \
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
    
    # Create realm with minimal settings
    local realm_config=$(cat <<EOF
{
    "realm": "$realm_name",
    "enabled": true
}
EOF
)

    log "Creating realm with config: $realm_config"
    
    local temp_file="/tmp/keycloak_response_$$"
    local http_code

    # Debug: show curl command
    log "Executing: curl -X POST $KEYCLOAK_URL/admin/realms -H 'Authorization: Bearer [TOKEN]' -H 'Content-Type: application/json' -d '$realm_config'"

    http_code=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$realm_config" \
        -o "$temp_file" 2>/dev/null)

    local response_body=""
    if [ -f "$temp_file" ]; then
        response_body=$(cat "$temp_file" 2>/dev/null || echo "")
        log "Temp file exists, size: $(wc -c < "$temp_file" 2>/dev/null || echo 0) bytes"
    else
        log "Temp file does not exist"
    fi
    rm -f "$temp_file"

    if [ "$http_code" = "201" ]; then
        log "Realm '$realm_name' created successfully"
        return 0
    elif [ "$http_code" = "409" ]; then
        warn "Realm '$realm_name' already exists, skipping"
        return 0
    else
        error "Failed to create realm '$realm_name' (HTTP $http_code)"
        error "Response: $response_body"
        return 1
    fi
}

# Helper function to convert comma-separated string to JSON array string
format_uris_for_json() {
    local uris_str="$1"
    if [ -z "$uris_str" ]; then
        echo '""' # Return empty JSON array string if input is empty
        return
    fi
    echo "$uris_str" | awk -F, '{
        for(i=1; i<=NF; i++) {
            gsub(/^[ \t]+|[ \t]+$/, "", $i); # Trim whitespace
            printf "%s\"%s\"", (i==1?"":","), $i
        }
    }'
}

# Create client with maximum wildcards for universal compatibility
create_universal_client() {
    local realm_name=$1
    local client_id=$2
    local redirect_uris_str=$3
    local web_origins_str=$4
    local token=$5

    log "Ensuring client '$client_id' exists and is correctly configured in realm '$realm_name'"
    log "Target Redirect URIs: $redirect_uris_str"
    log "Target Web Origins: $web_origins_str"

    # URL encode client_id - simple version for typical client_id characters
    local client_id_url_encoded
    client_id_url_encoded=$(echo "$client_id" | sed 's/%/%25/g; s/ /%20/g; s/!/%21/g; s/"/%22/g; s/#/%23/g; s/\$/%24/g; s/\&/%26/g; s/'\''/%27/g; s/(/%28/g; s/)/%29/g; s/\*/%2a/g; s/+/%2b/g; s/,/%2c/g; s/-/%2d/g; s/\./%2e/g; s/\//%2f/g; s/:/%3a/g; s/;/%3b/g; s/</%3c/g; s/=/%3d/g; s/>/%3e/g; s/?/%3f/g; s/@/%40/g; s/\[/%5b/g; s/\\/%5c/g; s/\]/%5d/g; s/\^/%5e/g; s/_/%5f/g; s/`/%60/g; s/{/%7b/g; s/|/%7c/g; s/}/%7d/g; s/~/%7e/g')

    local client_query_url="$KEYCLOAK_URL/admin/realms/$realm_name/clients?clientId=$client_id_url_encoded"
    log "Fetching client info from: $client_query_url"

    local clients_response
    clients_response=$(curl -s -X GET "$client_query_url" -H "Authorization: Bearer $token" -H "Content-Type: application/json")

    # Attempt to extract internal ID using grep and sed (jq would be better if available)
    # This expects the response to be a JSON array, and takes the id of the first element.
    # Example: [{"id":"uuid-goes-here","clientId":"actual-client-id",...}]
    local internal_id
    internal_id=$(echo "$clients_response" | grep -oP '"id":"\K[^"]+' | head -n 1)

    local formatted_redirects
    formatted_redirects=$(format_uris_for_json "$redirect_uris_str")
    local formatted_origins
    formatted_origins=$(format_uris_for_json "$web_origins_str")

    # Client configuration using parameterized values
    local client_config=$(cat <<EOF
{
    "clientId": "$client_id",
    "enabled": true,
    "publicClient": true,
    "redirectUris": [$formatted_redirects],
    "webOrigins": [$formatted_origins],
    "protocol": "openid-connect",
    "standardFlowEnabled": true,
    "implicitFlowEnabled": false,
    "directAccessGrantsEnabled": true,
    "serviceAccountsEnabled": false,
    "authorizationServicesEnabled": false,
    "fullScopeAllowed": true,
    "attributes": {
        "post.logout.redirect.uris": "+", # Using '+' as a flexible default for post logout
        "pkce.code.challenge.method": "S256",
        "access.token.lifespan": "300",
        "client.session.idle.timeout": "1800",
        "client.session.max.lifespan": "36000"
    }
}
EOF
)
    
    local temp_file="/tmp/keycloak_client_response_$$"
    local http_code
    local response_body

    if [ -n "$internal_id" ]; then
        log "Client '$client_id' (Internal ID: $internal_id) exists in realm '$realm_name'. Updating..."
        http_code=$(curl -s -w "%{http_code}" -X PUT "$KEYCLOAK_URL/admin/realms/$realm_name/clients/$internal_id" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$client_config" \
            -o "$temp_file" 2>/dev/null)

        response_body=$(cat "$temp_file" 2>/dev/null || echo "")
        rm -f "$temp_file"

        # For PUT, 200 or 204 (No Content) usually indicate success.
        if [ "$http_code" = "200" ] || [ "$http_code" = "204" ]; then
            log "Client '$client_id' updated successfully in realm '$realm_name'."
            return 0
        else
            error "Failed to update client '$client_id' in realm '$realm_name' (HTTP $http_code)."
            error "Response: $response_body"
            return 1
        fi
    else
        log "Client '$client_id' does not exist in realm '$realm_name'. Creating..."
        http_code=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms/$realm_name/clients" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$client_config" \
            -o "$temp_file" 2>/dev/null)

        response_body=$(cat "$temp_file" 2>/dev/null || echo "")
        rm -f "$temp_file"

        if [ "$http_code" = "201" ]; then
            log "Client '$client_id' created successfully in realm '$realm_name'."
            return 0
        else
            error "Failed to create client '$client_id' in realm '$realm_name' (HTTP $http_code)."
            error "Response: $response_body"
            return 1
        fi
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
    log "🚀 Starting Keycloak Setup..."
    log "🌐 Keycloak URL: $KEYCLOAK_URL"
    log "👤 Admin User for script: ${KC_BOOTSTRAP_ADMIN_USERNAME:-admin}" # Log effective admin user for the script
    log "🌍 Environment: ${NODE_ENV:-development}"
    
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
    log "✅ Admin token acquired successfully (length: ${#token})"
    
    # --- Admin Realm Setup ---
    log "--- Setting up Admin Realm: $REALM_ADMIN_NAME ---"
    if create_realm "$REALM_ADMIN_NAME" "$token"; then
        create_universal_client "$REALM_ADMIN_NAME" "$CLIENT_ADMIN_ID" "$CLIENT_ADMIN_REDIRECT_URIS" "$CLIENT_ADMIN_WEB_ORIGINS" "$token"
        create_test_user "$REALM_ADMIN_NAME" "$USER_ADMIN_USERNAME" "$USER_ADMIN_EMAIL" "$USER_ADMIN_PASSWORD" "$token"
    else
        error "Failed to create or find Admin Realm '$REALM_ADMIN_NAME'. Skipping client and user creation."
    fi

    # --- Buyer Realm Setup ---
    log "--- Setting up Buyer Realm: $REALM_BUYER_NAME ---"
    if create_realm "$REALM_BUYER_NAME" "$token"; then
        create_universal_client "$REALM_BUYER_NAME" "$CLIENT_BUYER_ID" "$CLIENT_BUYER_REDIRECT_URIS" "$CLIENT_BUYER_WEB_ORIGINS" "$token"
        create_test_user "$REALM_BUYER_NAME" "$USER_BUYER_USERNAME" "$USER_BUYER_EMAIL" "$USER_BUYER_PASSWORD" "$token"
    else
        error "Failed to create or find Buyer Realm '$REALM_BUYER_NAME'. Skipping client and user creation."
    fi

    # --- Seller Realm Setup ---
    log "--- Setting up Seller Realm: $REALM_SELLER_NAME ---"
    if create_realm "$REALM_SELLER_NAME" "$token"; then
        create_universal_client "$REALM_SELLER_NAME" "$CLIENT_SELLER_ID" "$CLIENT_SELLER_REDIRECT_URIS" "$CLIENT_SELLER_WEB_ORIGINS" "$token"
        create_test_user "$REALM_SELLER_NAME" "$USER_SELLER_USERNAME" "$USER_SELLER_EMAIL" "$USER_SELLER_PASSWORD" "$token"
    else
        error "Failed to create or find Seller Realm '$REALM_SELLER_NAME'. Skipping client and user creation."
    fi
    
    log ""
    log "🎉 Keycloak Setup Completed Successfully!"
    log ""
    log "🌐 Access URLs:"
    log "   Admin Console: $KEYCLOAK_URL/admin"
    log "   Admin credentials for console: ${KC_BOOTSTRAP_ADMIN_USERNAME:-admin} / {KC_BOOTSTRAP_ADMIN_PASSWORD}" # Password not logged for security
    log ""
    log "👥 Test users created (default credentials):"
    log "   $REALM_ADMIN_NAME: $USER_ADMIN_USERNAME / $USER_ADMIN_PASSWORD"
    log "   $REALM_BUYER_NAME: $USER_BUYER_USERNAME / $USER_BUYER_PASSWORD"
    log "   $REALM_SELLER_NAME: $USER_SELLER_USERNAME / $USER_SELLER_PASSWORD"
    log ""
    log "🔗 Realm URLs:"
    log "   $REALM_ADMIN_NAME: $KEYCLOAK_URL/realms/$REALM_ADMIN_NAME"
    log "   $REALM_BUYER_NAME: $KEYCLOAK_URL/realms/$REALM_BUYER_NAME"
    log "   $REALM_SELLER_NAME: $KEYCLOAK_URL/realms/$REALM_SELLER_NAME"
    log ""
    log "⭐ Clients configured with specified redirect URIs and web origins."
}

# Run main function
main "$@"
