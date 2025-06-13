# Project Setup Guide

This document outlines the steps to set up and run the project locally using Docker Compose.

## Prerequisites

- Docker: [Install Docker](https://docs.docker.com/get-docker/)
- Docker Compose: Usually included with Docker Desktop. Verify with `docker-compose --version`.
- Git: [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- SMTP server details (e.g., Gmail App Password) if email functionality is to be tested for Keycloak.

## Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name> # Or your specific project directory name, e.g., 'diplom'
    ```

2.  **Configure Environment Variables:**
    This project uses `.env` files for environment-specific configurations. Ensure you copy any `.env.example` files to `.env` and customize them.

    **Keycloak Service (`keycloak/.env`):**
    - Navigate to the `keycloak/` directory:
      ```bash
      cd keycloak
      ```
    - Copy the example environment file:
      ```bash
      cp .env.example .env
      ```
    - Edit `keycloak/.env` and **carefully** fill in the required credentials:
        - `KEYCLOAK_ADMIN` and `KEYCLOAK_ADMIN_PASSWORD`: For the initial Keycloak admin user.
        - `KEYCLOAK_PORT`: Public port for Keycloak.

        - **PostgreSQL Database (for Keycloak):**
            - `POSTGRES_DB`: Name of the database Keycloak will use (e.g., `keycloak`).
            - `POSTGRES_USER`: Username for PostgreSQL. **This user will be created by the PostgreSQL container.**
            - `POSTGRES_PASSWORD`: Password for the PostgreSQL user.

        - **Keycloak's Database Connection:**
            - `KC_DB_USERNAME`: Username Keycloak uses to connect to its database. **IMPORTANT: This MUST match the `POSTGRES_USER` value you set above.**
            - `KC_DB_PASSWORD`: Password Keycloak uses to connect. **IMPORTANT: This MUST match the `POSTGRES_PASSWORD` value you set above.**
            - `KC_DB_URL`: The JDBC URL. **IMPORTANT: Ensure the hostname matches the PostgreSQL service name in `keycloak/docker-compose.yaml` (which is `keycloak-postgres`) and the database name matches `POSTGRES_DB`.**
              Example: `jdbc:postgresql://keycloak-postgres:5432/keycloak` (if `POSTGRES_DB=keycloak`). The `${POSTGRES_DB}` variable is already used in the `.env.example` for this.

        - **Keycloak Hostname Configuration:** These settings help Keycloak generate correct public-facing URLs (e.g., in emails).
            - `KC_HOSTNAME_URL`: The public URL for Keycloak. For local development, this is typically `http://localhost:${KEYCLOAK_PORT}` (e.g., `http://localhost:8030`).
            - `KC_HOSTNAME_STRICT_HTTPS`: Set to `false` for local HTTP development. Set to `true` if Keycloak is behind a reverse proxy that terminates SSL.

        - **SMTP Server Details:** (`KC_SMTP_SERVER_HOST`, etc.) as per `docs/GMAIL_SMTP_CONFIG.md` if using Gmail, or your provider's details.
    - `cd ..` to return to the project root.

    *(Check for and configure other `.env` files for backend/frontend services as needed based on their respective `.env.example` files.)*

3.  **Build and Run Services:**
    - From the project root directory (where the main `docker-compose.yaml` is located):
      ```bash
      docker-compose up --build -d
      ```
    - This command will:
        - Build the images for all services.
        - Start all services in detached mode.
        - Keycloak will automatically import realm configurations from `keycloak/data-to-import/realms/` (mounted from the local path `./data-to-import/realms/` within the `keycloak` service directory, as defined in `keycloak/docker-compose.yaml`) on its first startup. This includes `BuyerRealm`, `SellerRealm`, and `AdminRealm`.
        - Note: The Keycloak Docker configuration has also been optimized to use the `start` command (instead of `start-dev`) and includes healthchecks for better stability and production readiness.

4.  **Accessing Services and Understanding Keycloak Realms:**
    (This section remains largely the same as the previous correct version, detailing Buyer/Seller/Admin realms and other service URLs)
    - **Keycloak Admin Console:** `http://localhost:8030` (or the port specified in `keycloak/.env` for `KEYCLOAK_PORT`).
        - Username: `admin` (or `KEYCLOAK_ADMIN` from `keycloak/.env`).
        - Password: The one you set for `KEYCLOAK_ADMIN_PASSWORD` in `keycloak/.env`.
        - From here, you can view and manage the three imported realms: `BuyerRealm`, `SellerRealm`, and `AdminRealm`.

    - **Keycloak Realm Specifics & User Registration:**
        - **`BuyerRealm`:** For customers.
            - **Registration:** Buyers can self-register. The registration page can typically be found via the `BuyerRealm`'s account console login page.
            - **Account Console Example:** `http://localhost:8030/realms/BuyerRealm/account/`
        - **`SellerRealm`:** For sellers.
            - **Registration:** Sellers **cannot** self-register. Their accounts must be created by an Administrator.
            - **Account Console Example:** `http://localhost:8030/realms/SellerRealm/account/`
        - **`AdminRealm`:** For platform administrators.
            - **Registration:** Administrators **cannot** self-register.
            - **Account Console Example:** `http://localhost:8030/realms/AdminRealm/account/`

    - **Backend API:** `http://localhost:8000`
        - **API Documentation:** `http://localhost:8000/docs`
    - **AI Микросервис (анализ досок):** `http://localhost:8001`
    - **YOLO Детекция:** `http://localhost:8002`
    - **Admin Frontend:** `http://localhost:8080`
    - **Seller Frontend:** `http://localhost:8081`
    - **Buyer Frontend:** `http://localhost:8082`

## Troubleshooting

- **Port Conflicts:** If a service fails to start, check if the required ports are already in use. Modify ports in the relevant `.env` files or `docker-compose.yaml`.
- **Keycloak Import Issues:** Check Keycloak container logs (`docker-compose logs keycloak`) for errors related to realm import. Ensure JSON files in `keycloak/data-to-import/realms/` (`AdminRealm-realm.json`, `BuyerRealm-realm.json`, `SellerRealm-realm.json`) are present and valid, and that the volume mount in `keycloak/docker-compose.yaml` correctly points to `./data-to-import/realms/`.
- **Database Connection (Keycloak):**
    - **Symptom:** Keycloak fails to start with errors like "Failed to obtain JDBC connection," "password authentication failed," or "Role ... does not exist."
    - **Check `keycloak/.env`:**
        - Ensure `POSTGRES_USER` and `KC_DB_USERNAME` have the **exact same value**.
        - Ensure `POSTGRES_PASSWORD` and `KC_DB_PASSWORD` have the **exact same value**.
        - Verify `KC_DB_URL` is correct, e.g., `jdbc:postgresql://keycloak-postgres:5432/keycloak` (the hostname `keycloak-postgres` must match the service name of your PostgreSQL container in `keycloak/docker-compose.yaml`).
    - Ensure the PostgreSQL container (`keycloak-postgres`) is running and healthy before Keycloak attempts to connect (the `depends_on` with `service_healthy` condition in `docker-compose.yaml` should handle this, but verify Postgres logs if issues persist).

## Stopping Services

- To stop all running services defined in the root `docker-compose.yaml`:
  ```bash
  docker-compose down
  ```
- To stop and remove volumes (deletes data, including Keycloak database):
  ```bash
  docker-compose down -v
  ```
```
