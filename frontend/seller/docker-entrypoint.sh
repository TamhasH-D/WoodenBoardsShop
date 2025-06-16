#!/bin/sh

# Universal frontend configuration script
# Works for both development and production environments

echo "🔧 Configuring universal frontend URLs..."

# Environment detection
NODE_ENV="${NODE_ENV:-development}"
echo "🌍 Environment: $NODE_ENV"

# Default configuration
DEFAULT_LOCALHOST_HOST="localhost"
DEFAULT_DOCKER_HOST="172.27.65.14"
DEFAULT_PRODUCTION_HOST="your-domain.com"
DEFAULT_KEYCLOAK_HOST="172.27.65.14"
DEFAULT_KEYCLOAK_PORT="8030"
DEFAULT_FRONTEND_PORT="8082"

# Set defaults from environment or use hardcoded defaults
LOCALHOST_HOST="${LOCALHOST_HOST:-$DEFAULT_LOCALHOST_HOST}"
DOCKER_HOST="${DOCKER_HOST:-$DEFAULT_DOCKER_HOST}"
PRODUCTION_HOST="${PRODUCTION_HOST:-$DEFAULT_PRODUCTION_HOST}"
KEYCLOAK_HOST="${KEYCLOAK_HOST:-$DEFAULT_KEYCLOAK_HOST}"
KEYCLOAK_PORT="${KEYCLOAK_PORT:-$DEFAULT_KEYCLOAK_PORT}"
FRONTEND_PORT="${FRONTEND_PORT:-$DEFAULT_FRONTEND_PORT}"

# Auto-detect current environment and host
detect_host() {
    # Check if we're in production mode
    if [ "$NODE_ENV" = "production" ]; then
        echo "📦 Production mode detected"
        # Use production domain for buyer frontend
        echo "${PRODUCTION_BUYER_HOST:-buyer.${PRODUCTION_HOST}}"
    else
        # Development mode
        if [ -f /.dockerenv ]; then
            echo "🔧 Development mode in Docker"
            echo "$DOCKER_HOST"
        else
            echo "💻 Development mode locally"
            echo "$LOCALHOST_HOST"
        fi
    fi
}

# Detect Keycloak host
detect_keycloak_host() {
    if [ "$NODE_ENV" = "production" ]; then
        echo "${PRODUCTION_KEYCLOAK_HOST:-keycloak.${PRODUCTION_HOST}}"
    else
        echo "$KEYCLOAK_HOST"
    fi
}

# Detect current hosts for Seller Frontend
detect_seller_host() {
    if [ "$NODE_ENV" = "production" ]; then
        echo "${PRODUCTION_SELLER_HOST:-seller.${PRODUCTION_HOST}}"
    else
        if [ -f /.dockerenv ]; then
            echo "$DOCKER_HOST"
        else
            echo "$LOCALHOST_HOST"
        fi
    fi
}

CURRENT_HOST=$(detect_seller_host)
CURRENT_KEYCLOAK_HOST=$(detect_keycloak_host)
echo "📍 Using seller frontend host: $CURRENT_HOST"
echo "🔐 Using Keycloak host: $CURRENT_KEYCLOAK_HOST"

# Build URLs based on detected environment
if [ "$NODE_ENV" = "production" ]; then
    # Production uses HTTPS and standard ports
    PROTOCOL="https"
    KEYCLOAK_PROTOCOL="https"
    FRONTEND_PORT_SUFFIX=""
    KEYCLOAK_PORT_SUFFIX=""

    # For production domains, don't add port numbers
    if [[ "$CURRENT_HOST" == *.taruman.ru ]]; then
        FRONTEND_PORT_SUFFIX=""
    fi
    if [[ "$CURRENT_KEYCLOAK_HOST" == *.taruman.ru ]]; then
        KEYCLOAK_PORT_SUFFIX=""
    fi
else
    # Development uses HTTP with explicit ports
    PROTOCOL="http"
    KEYCLOAK_PROTOCOL="http"
    FRONTEND_PORT_SUFFIX=":${FRONTEND_PORT}"
    KEYCLOAK_PORT_SUFFIX=":${KEYCLOAK_PORT}"
fi

# Build OIDC URLs for Seller
REACT_APP_OIDC_AUTHORITY="${KEYCLOAK_PROTOCOL}://${CURRENT_KEYCLOAK_HOST}${KEYCLOAK_PORT_SUFFIX}/realms/SellerRealm"
REACT_APP_OIDC_CLIENT_ID="seller-frontend"
REACT_APP_OIDC_REDIRECT_URI="${PROTOCOL}://${CURRENT_HOST}${FRONTEND_PORT_SUFFIX}/auth/callback"
REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI="${PROTOCOL}://${CURRENT_HOST}${FRONTEND_PORT_SUFFIX}"

echo "🔗 OIDC Authority: $REACT_APP_OIDC_AUTHORITY"
echo "🔗 Redirect URI: $REACT_APP_OIDC_REDIRECT_URI"
echo "🔗 Post Logout URI: $REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI"

# Export environment variables for React
export REACT_APP_OIDC_AUTHORITY
export REACT_APP_OIDC_CLIENT_ID
export REACT_APP_OIDC_REDIRECT_URI
export REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI
export REACT_APP_FRONTEND_HOST="$CURRENT_HOST"
export REACT_APP_FRONTEND_PORT="$FRONTEND_PORT"
export REACT_APP_KEYCLOAK_HOST="$CURRENT_KEYCLOAK_HOST"
export REACT_APP_KEYCLOAK_PORT="$KEYCLOAK_PORT"

# Create runtime environment file for React (for runtime configuration)
# Different paths for dev and production
if [ "$NODE_ENV" = "production" ]; then
    CONFIG_DIR="/usr/share/nginx/html/config"
    mkdir -p "$CONFIG_DIR"
    CONFIG_FILE="$CONFIG_DIR/env-config.js"
else
    CONFIG_DIR="/app/public"
    mkdir -p "$CONFIG_DIR"
    CONFIG_FILE="$CONFIG_DIR/env-config.js"
fi

cat > "$CONFIG_FILE" << EOF
window._env_ = {
  NODE_ENV: "${NODE_ENV}",
  REACT_APP_OIDC_AUTHORITY: "${REACT_APP_OIDC_AUTHORITY}",
  REACT_APP_OIDC_CLIENT_ID: "${REACT_APP_OIDC_CLIENT_ID}",
  REACT_APP_OIDC_REDIRECT_URI: "${REACT_APP_OIDC_REDIRECT_URI}",
  REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI: "${REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI}",
  REACT_APP_FRONTEND_HOST: "${CURRENT_HOST}",
  REACT_APP_FRONTEND_PORT: "${FRONTEND_PORT}",
  REACT_APP_KEYCLOAK_HOST: "${CURRENT_KEYCLOAK_HOST}",
  REACT_APP_KEYCLOAK_PORT: "${KEYCLOAK_PORT}",
  REACT_APP_API_URL: "${PROTOCOL}://${PRODUCTION_API_HOST:-api.${PRODUCTION_HOST}}"
};
EOF

echo "✅ Universal configuration completed!"
echo "🚀 Starting application..."

# Start the original command
exec "$@"
