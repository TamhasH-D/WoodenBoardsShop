#!/bin/bash

# Script to configure Keycloak realms using kcadm.sh

# --- Configuration Variables ---
# !!! IMPORTANT: Adjust KCADM_CMD to the correct path of your kcadm.sh script !!!
KCADM_CMD="/opt/keycloak/bin/kcadm.sh" # Common path, but might vary

ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin_password" # Replace with your actual admin password
KEYCLOAK_SERVER_URL="http://localhost:8080" # Default Keycloak URL
REALM_NAMES=("UserRealm1" "UserRealm2" "UserRealm3")

# --- Helper Function for Output ---
log_message() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1"
}

# --- Sanity Check: kcadm.sh availability ---
if ! command -v "$KCADM_CMD" &> /dev/null && ! [ -x "$KCADM_CMD" ]; then
    log_message "ERROR: kcadm.sh not found or not executable at '$KCADM_CMD'."
    log_message "Please install Keycloak client tools or update the KCADM_CMD variable in this script."
    exit 1
fi
log_message "Using kcadm.sh found at: $KCADM_CMD"

# --- 1. Authenticate to Master Realm ---
log_message "Attempting to authenticate to master realm ($KEYCLOAK_SERVER_URL)..."
# The --server URL for config credentials should be the base URL of the Keycloak server.
if "$KCADM_CMD" config credentials --server "$KEYCLOAK_SERVER_URL" --realm master --user "$ADMIN_USERNAME" --password "$ADMIN_PASSWORD"; then
    log_message "Authentication to master realm successful."
else
    log_message "ERROR: Authentication to master realm failed. Please check credentials, Keycloak server status, and KCADM_CMD path."
    # It's possible kcadm.sh was found, but can't connect or auth.
    # Provide more specific advice if possible, e.g. check Keycloak is running.
    log_message "Ensure Keycloak is running at $KEYCLOAK_SERVER_URL and accessible."
    exit 1
fi

# --- 2. Process Each Realm ---
for REALM_NAME in "${REALM_NAMES[@]}"; do
    log_message "--- Processing Realm: $REALM_NAME ---"

    # Target specific realm for subsequent commands
    KCADM_REALM_CMD="$KCADM_CMD --realm $REALM_NAME"

    # --- a. Create the Realm ---
    log_message "Creating realm '$REALM_NAME'..."
    # kcadm.sh create realms does not need --realm $REALM_NAME in its arguments, it operates on the 'master' realm context or specified by --server
    if $KCADM_CMD create realms -s realm="$REALM_NAME" -s enabled=true; then
        log_message "Realm '$REALM_NAME' created successfully."
    else
        log_message "WARNING: Failed to create realm '$REALM_NAME'. It might already exist. Checking..."
        if $KCADM_CMD get realms/"$REALM_NAME" > /dev/null 2>&1; then
            log_message "Realm '$REALM_NAME' already exists. Proceeding with configuration."
        else
            log_message "ERROR: Realm '$REALM_NAME' does not exist and creation failed. Skipping this realm."
            continue
        fi
    fi

    # --- b. Enable User Registration ---
    log_message "Enabling user registration for '$REALM_NAME'..."
    if $KCADM_CMD update realms/"$REALM_NAME" -s registrationAllowed=true; then
        log_message "User registration enabled for '$REALM_NAME'."
    else
        log_message "ERROR: Failed to enable user registration for '$REALM_NAME'."
    fi

    # --- c. Enable 'Verify Email' Feature ---
    log_message "Enabling 'Verify Email' feature for '$REALM_NAME'..."
    if $KCADM_CMD update realms/"$REALM_NAME" -s verifyEmail=true; then
        log_message "'Verify Email' feature enabled for '$REALM_NAME'."
    else
        log_message "ERROR: Failed to enable 'Verify Email' for '$REALM_NAME'."
    fi

    # --- d. Enable 'Forgot Password' Feature ---
    log_message "Enabling 'Forgot Password' feature for '$REALM_NAME'..."
    if $KCADM_CMD update realms/"$REALM_NAME" -s resetPasswordAllowed=true; then
        log_message "'Forgot Password' feature enabled for '$REALM_NAME'."
    else
        log_message "ERROR: Failed to enable 'Forgot Password' for '$REALM_NAME'."
    fi

    # --- e. Enable 'Login with Email' ---
    log_message "Configuring 'Login with Email' for '$REALM_NAME'..."
    # For email as username: registrationEmailAsUsername=true.
    # loginWithEmailAllowed=true allows users to login with their email address if they have a separate username.
    # duplicateEmailsAllowed=false is generally recommended.
    if $KCADM_CMD update realms/"$REALM_NAME" -s registrationEmailAsUsername=true -s loginWithEmailAllowed=true -s duplicateEmailsAllowed=false; then
        log_message "'Login with Email' (email as username, unique emails) configured for '$REALM_NAME'."
    else
        log_message "ERROR: Failed to configure 'Login with Email' for '$REALM_NAME'."
    fi

    # --- f. Set 'Verify Email' as a Default Required Action ---
    log_message "Setting 'Verify Email' as a default required action for new users in '$REALM_NAME'..."

    # Get current required actions JSON string
    REQUIRED_ACTIONS_JSON=$($KCADM_CMD get realms/"$REALM_NAME" -F requiredActions --format csv --noquotes)

    if [ -z "$REQUIRED_ACTIONS_JSON" ] || [ "$REQUIRED_ACTIONS_JSON" == "[]" ]; then
        # If no actions or empty array, set VERIFY_EMAIL directly
        UPDATED_ACTIONS_JSON="[\"VERIFY_EMAIL\"]"
    else
        # Check if VERIFY_EMAIL is already present
        if echo "$REQUIRED_ACTIONS_JSON" | grep -q "VERIFY_EMAIL"; then
            log_message "'Verify Email' is already in required actions for '$REALM_NAME'."
            UPDATED_ACTIONS_JSON="$REQUIRED_ACTIONS_JSON" # No change needed
        else
            # Add VERIFY_EMAIL to the existing list
            # Remove trailing ]
            TEMP_ACTIONS=${REQUIRED_ACTIONS_JSON%]}
            # Add VERIFY_EMAIL
            if [ "$TEMP_ACTIONS" == "[" ]; then # If array was empty like "[]" but somehow not caught above
                 UPDATED_ACTIONS_JSON="[\"VERIFY_EMAIL\"]"
            else
                 UPDATED_ACTIONS_JSON="${TEMP_ACTIONS},\"VERIFY_EMAIL\"]"
            fi
        fi
    fi

    if [ "$REQUIRED_ACTIONS_JSON" != "$UPDATED_ACTIONS_JSON" ]; then
        if $KCADM_CMD update realms/"$REALM_NAME" -s "requiredActions=$UPDATED_ACTIONS_JSON"; then
             log_message "'Verify Email' set/updated as a default required action for '$REALM_NAME'."
        else
             log_message "ERROR: Failed to set 'Verify Email' as a default required action for '$REALM_NAME'. Current JSON: $REQUIRED_ACTIONS_JSON , Attempted: $UPDATED_ACTIONS_JSON"
        fi
    fi

    # --- g. 'Forgot Password' availability ---
    # This is primarily controlled by `resetPasswordAllowed=true` (set in step d).
    # No separate "default required action" is typically set for forgot password itself.
    # It's a user-initiated flow.

    log_message "Configuration for realm '$REALM_NAME' completed."
done

log_message "All realms processed. Keycloak configuration script finished."
log_message "IMPORTANT: If authentication or other errors occurred, ensure KCADM_CMD path is correct, Keycloak is running at $KEYCLOAK_SERVER_URL, and admin credentials are valid."

# --- End of Script ---
