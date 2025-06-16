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
    # Check if we're in Docker
    if [ -f /.dockerenv ]; then
        echo "🐳 Running in Docker container"

        # Try to detect if we're in development or production
        if [ "$NODE_ENV" = "production" ]; then
            echo "📦 Production mode detected"
            echo "$PRODUCTION_HOST"
        else
            echo "🔧 Development mode detected"
            # In Docker development, use Docker host
            echo "$DOCKER_HOST"
        fi
    else
        echo "💻 Running locally"
        echo "$LOCALHOST_HOST"
    fi
}

# Detect current host
CURRENT_HOST=$(detect_host)
echo "📍 Using host: $CURRENT_HOST"

# Build URLs based on detected environment
REACT_APP_KEYCLOAK_HOST="$KEYCLOAK_HOST"
REACT_APP_KEYCLOAK_PORT="$KEYCLOAK_PORT"
REACT_APP_FRONTEND_HOST="$CURRENT_HOST"
REACT_APP_FRONTEND_PORT="$FRONTEND_PORT"

# Build OIDC URLs
REACT_APP_OIDC_AUTHORITY="http://${REACT_APP_KEYCLOAK_HOST}:${REACT_APP_KEYCLOAK_PORT}/realms/BuyerRealm"
REACT_APP_OIDC_CLIENT_ID="buyer-frontend"
REACT_APP_OIDC_REDIRECT_URI="http://${REACT_APP_FRONTEND_HOST}:${REACT_APP_FRONTEND_PORT}/auth/callback"
REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI="http://${REACT_APP_FRONTEND_HOST}:${REACT_APP_FRONTEND_PORT}"

# For production, also support HTTPS
if [ "$NODE_ENV" = "production" ]; then
    REACT_APP_OIDC_AUTHORITY_HTTPS="https://${REACT_APP_KEYCLOAK_HOST}:${REACT_APP_KEYCLOAK_PORT}/realms/BuyerRealm"
    REACT_APP_OIDC_REDIRECT_URI_HTTPS="https://${REACT_APP_FRONTEND_HOST}:${REACT_APP_FRONTEND_PORT}/auth/callback"
    REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI_HTTPS="https://${REACT_APP_FRONTEND_HOST}:${REACT_APP_FRONTEND_PORT}"
fi

echo "🔗 OIDC Authority: $REACT_APP_OIDC_AUTHORITY"
echo "🔗 Redirect URI: $REACT_APP_OIDC_REDIRECT_URI"
echo "🔗 Post Logout URI: $REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI"

# Export environment variables for React
export REACT_APP_OIDC_AUTHORITY
export REACT_APP_OIDC_CLIENT_ID
export REACT_APP_OIDC_REDIRECT_URI
export REACT_APP_OIDC_POST_LOGOUT_REDIRECT_URI
export REACT_APP_FRONTEND_HOST
export REACT_APP_FRONTEND_PORT
export REACT_APP_KEYCLOAK_HOST
export REACT_APP_KEYCLOAK_PORT

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
  REACT_APP_FRONTEND_HOST: "${REACT_APP_FRONTEND_HOST}",
  REACT_APP_FRONTEND_PORT: "${REACT_APP_FRONTEND_PORT}",
  REACT_APP_KEYCLOAK_HOST: "${REACT_APP_KEYCLOAK_HOST}",
  REACT_APP_KEYCLOAK_PORT: "${REACT_APP_KEYCLOAK_PORT}"
};
EOF

echo "✅ Universal configuration completed!"
echo "🚀 Starting application..."

# Start the original command
exec "$@"
