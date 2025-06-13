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
    - Edit `keycloak/.env` and fill in the required credentials:
        - `KEYCLOAK_ADMIN_PASSWORD`
        - `POSTGRES_PASSWORD` (for Keycloak's database)
        - `KC_DB_PASSWORD` (should be same as `POSTGRES_PASSWORD`)
        - SMTP server details (`KC_SMTP_SERVER_HOST`, etc.) as per `docs/GMAIL_SMTP_CONFIG.md` if using Gmail, or your provider's details.
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

    - **Keycloak Admin Console:** `http://localhost:8030` (or the port specified in `keycloak/.env` for `KEYCLOAK_PORT`).
        - Username: `admin` (or `KEYCLOAK_ADMIN` from `keycloak/.env`).
        - Password: The one you set for `KEYCLOAK_ADMIN_PASSWORD` in `keycloak/.env`.
        - From here, you can view and manage the three imported realms: `BuyerRealm`, `SellerRealm`, and `AdminRealm`.

    - **Keycloak Realm Specifics & User Registration:**
        - **`BuyerRealm`:** For customers.
            - **Registration:** Buyers can self-register. The registration page can typically be found via the `BuyerRealm`'s account console login page.
            - **Account Console Example:** `http://localhost:8030/realms/BuyerRealm/account/`
        - **`SellerRealm`:** For sellers.
            - **Registration:** Sellers **cannot** self-register. Their accounts must be created by an Administrator (e.g., via the Keycloak Admin Console by navigating to the `SellerRealm`, then Users -> Add user; or via a dedicated admin panel in your application that uses the Keycloak API).
            - **Account Console Example:** `http://localhost:8030/realms/SellerRealm/account/`
        - **`AdminRealm`:** For platform administrators.
            - **Registration:** Administrators **cannot** self-register. Their accounts are typically pre-provisioned or created by a super-administrator (e.g., via the Keycloak Admin Console by navigating to the `AdminRealm`, then Users -> Add user).
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
- **Database Connection:** Ensure PostgreSQL container for Keycloak (`keycloak-postgres`) is running and Keycloak has the correct DB credentials in `keycloak/.env`.

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
