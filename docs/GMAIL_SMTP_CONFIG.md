# Configuring Gmail as SMTP Server for Keycloak

This guide explains how to configure Keycloak to use Gmail for sending emails (e.g., email verification, forgot password).

## Prerequisites

- A Google Account.
- 2-Step Verification enabled on your Google Account.
- An App Password generated for your Google Account.

## Steps

1.  **Enable 2-Step Verification:**
    - Go to your Google Account settings: [https://myaccount.google.com/security](https://myaccount.google.com/security)
    - Under "Signing in to Google," select "2-Step Verification" and follow the on-screen steps.

2.  **Generate an App Password:**
    - Once 2-Step Verification is enabled, go to App Passwords: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
    - You might be asked to sign in again.
    - At the bottom, click "Select app" and choose "Other (Custom name)".
    - Give it a name (e.g., "Keycloak Local Dev") and click "Generate".
    - A 16-character password will be displayed. **Copy this password immediately.** You won't be able to see it again. This is what you will use as `KC_SMTP_PASSWORD`.

3.  **Configure Keycloak Environment Variables:**
    - Open your `keycloak/.env` file (create it from `keycloak/.env.example` if you haven't).
    - Update the SMTP section with the following details:

    ```env
    # ... other variables ...

    ### Keycloak SMTP Configuration (for Master Realm email sending) ###
    KC_SMTP_SERVER_HOST=smtp.gmail.com
    KC_SMTP_SERVER_PORT=587
    KC_SMTP_FROM=your_gmail_address@gmail.com  # Your Gmail address
    KC_SMTP_AUTH=true
    KC_SMTP_USER=your_gmail_address@gmail.com  # Your Gmail address
    KC_SMTP_PASSWORD=your_16_character_app_password # The App Password you generated
    KC_SMTP_STARTTLS=true
    KC_SMTP_SSL=false # Important: SSL should be false if STARTTLS is true for port 587
    ```

    - Replace `your_gmail_address@gmail.com` with your actual Gmail address.
    - Replace `your_16_character_app_password` with the App Password you generated in Step 2.

4.  **Restart Keycloak:**
    - If Keycloak is already running, you'll need to restart it to apply the new environment variables:
      ```bash
      docker-compose restart keycloak
      ```
    - If starting fresh:
      ```bash
      docker-compose up -d --build keycloak
      ```

## Testing Email Sending

- After configuration, you can test email sending from the Keycloak Admin Console:
    - Go to Realm Settings -> Email tab.
    - Enter your email address in the "Test connection" section and click "Test connection".
- Alternatively, try a user registration flow that requires email verification.

## Important Notes

- **Security:** App Passwords grant significant access. Keep them secure. Do not commit them directly into version control if this were a production `.env` file (though for local dev in `.env` which is gitignored, it's acceptable).
- **Gmail Sending Limits:** Gmail has sending limits for personal accounts. For high-volume email sending, consider dedicated transactional email services (e.g., SendGrid, Mailgun, AWS SES).
- **"Less Secure App Access":** Using App Passwords is the recommended way for programmatic access when 2-Step Verification is enabled. Avoid enabling "Less secure app access" if possible.
```
