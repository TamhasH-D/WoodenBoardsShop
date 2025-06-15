FROM quay.io/keycloak/keycloak:22.0.0

# Switch to root to install packages
USER root

# Try to install curl using available package manager
RUN if command -v microdnf >/dev/null 2>&1; then \
        microdnf install -y curl; \
    elif command -v dnf >/dev/null 2>&1; then \
        dnf install -y curl; \
    elif command -v yum >/dev/null 2>&1; then \
        yum install -y curl; \
    elif command -v apk >/dev/null 2>&1; then \
        apk add --no-cache curl; \
    else \
        echo "No package manager found, will use wget or bash alternatives"; \
    fi

# Copy setup scripts
COPY scripts/setup-keycloak.sh /opt/keycloak/scripts/setup-keycloak.sh
COPY scripts/entrypoint.sh /opt/keycloak/scripts/entrypoint.sh

# Make scripts executable
RUN chmod +x /opt/keycloak/scripts/*.sh

# Create data directory for marker files
RUN mkdir -p /opt/keycloak/data && chown -R keycloak:keycloak /opt/keycloak/data

# Switch back to keycloak user
USER keycloak

# Set custom entrypoint
ENTRYPOINT ["/opt/keycloak/scripts/entrypoint.sh"]
