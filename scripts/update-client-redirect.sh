#!/bin/bash

# Script to update buyer-frontend client redirect URIs
# This script adds localhost:3000 to the allowed redirect URIs

KEYCLOAK_URL="http://172.27.65.14:8030"
REALM="BuyerRealm"
CLIENT_ID="buyer-frontend"

echo "Updating client redirect URIs for $CLIENT_ID in $REALM..."

# Try to get admin token using different approaches
echo "Attempting to get admin token..."

# Method 1: Try with admin/admin in master realm
TOKEN_RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=admin" \
    -d "password=admin" \
    -d "grant_type=password" \
    -d "client_id=admin-cli")

echo "Token response: $TOKEN_RESPONSE"

# Check if we got a token
if echo "$TOKEN_RESPONSE" | grep -q "access_token"; then
    ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')
    echo "Got admin token successfully"
    
    # Get current client configuration
    echo "Getting current client configuration..."
    CLIENT_RESPONSE=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json")
    
    # Find the buyer-frontend client
    CLIENT_UUID=$(echo "$CLIENT_RESPONSE" | jq -r ".[] | select(.clientId==\"$CLIENT_ID\") | .id")
    
    if [ -n "$CLIENT_UUID" ] && [ "$CLIENT_UUID" != "null" ]; then
        echo "Found client UUID: $CLIENT_UUID"
        
        # Get detailed client configuration
        CLIENT_DETAILS=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients/$CLIENT_UUID" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json")
        
        echo "Current redirect URIs:"
        echo "$CLIENT_DETAILS" | jq -r '.redirectUris[]'
        
        # Update client with new redirect URIs
        UPDATED_CLIENT=$(echo "$CLIENT_DETAILS" | jq '.redirectUris += ["http://localhost:3000/auth/callback", "http://localhost:3000/*"] | .webOrigins += ["http://localhost:3000"] | .postLogoutRedirectUris += ["http://localhost:3000", "http://localhost:3000/"]')
        
        echo "Updating client configuration..."
        UPDATE_RESPONSE=$(curl -s -X PUT "$KEYCLOAK_URL/admin/realms/$REALM/clients/$CLIENT_UUID" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$UPDATED_CLIENT")
        
        if [ $? -eq 0 ]; then
            echo "Client updated successfully!"
            echo "New redirect URIs should include localhost:3000"
        else
            echo "Failed to update client"
            echo "Response: $UPDATE_RESPONSE"
        fi
    else
        echo "Could not find client $CLIENT_ID"
    fi
else
    echo "Failed to get admin token"
    echo "Response: $TOKEN_RESPONSE"
    
    # Try alternative: create admin user first
    echo "Trying to create admin user in master realm..."
    # This would require a different approach
fi
