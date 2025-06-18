FROM quay.io/keycloak/keycloak:26.2.5

# Copy custom scripts to the image
# Assumes the Docker build context is the 'keycloak' directory.
COPY ./scripts/ /opt/keycloak/scripts/

# Ensure scripts are executable
# This is crucial for the entrypoint and any scripts it calls.
RUN chmod +x /opt/keycloak/scripts/entrypoint.sh && \
    chmod +x /opt/keycloak/scripts/setup-universal.sh && \
    chmod +x /opt/keycloak/scripts/setup-keycloak.sh
    # Note: setup-keycloak.sh might be a legacy or placeholder name from problem description,
    # ensure the actual script names used by entrypoint.sh have execute permissions.
    # The setup-universal.sh is actively used.

# Set custom entrypoint
ENTRYPOINT ["/opt/keycloak/scripts/entrypoint.sh"]

# The default Keycloak command (e.g., 'start-dev' or 'start') is typically managed by Keycloak's own scripts.
# Our custom entrypoint.sh is responsible for calling the appropriate Keycloak start command (e.g., /opt/keycloak/bin/kc.sh start).
# Therefore, no explicit CMD is needed here if entrypoint.sh handles the full startup sequence.
