# PowerShell script to configure Keycloak realms using REST API
# This script creates three realms: AdminRealm, BuyerRealm, SellerRealm

# Configuration
$KEYCLOAK_URL = "http://localhost:8030"
$ADMIN_USERNAME = "admin"
$ADMIN_PASSWORD = "admin"
$REALMS = @("AdminRealm", "BuyerRealm", "SellerRealm")

# Function to log messages
function Write-Log {
    param($Message)
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - $Message"
}

# Function to get admin access token
function Get-AdminToken {
    $body = @{
        grant_type = "password"
        client_id = "admin-cli"
        username = $ADMIN_USERNAME
        password = $ADMIN_PASSWORD
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
        return $response.access_token
    }
    catch {
        Write-Log "ERROR: Failed to get admin token: $($_.Exception.Message)"
        return $null
    }
}

# Function to create realm
function Create-Realm {
    param($RealmName, $Token)
    
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }
    
    $realmConfig = @{
        realm = $RealmName
        enabled = $true
        registrationAllowed = $true
        verifyEmail = $true
        resetPasswordAllowed = $true
        loginWithEmailAllowed = $true
        duplicateEmailsAllowed = $false
        registrationEmailAsUsername = $true
        smtpServer = @{
            host = "smtp.gmail.com"
            port = "587"
            from = "eugenenag@gmail.com"
            auth = $true
            user = "eugenenag@gmail.com"
            password = "nnce xyhu ydsq vqxu"
            starttls = $true
            ssl = $false
        }
    } | ConvertTo-Json -Depth 10
    
    try {
        Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms" -Method Post -Body $realmConfig -Headers $headers
        Write-Log "Realm '$RealmName' created successfully"
        return $true
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Log "Realm '$RealmName' already exists"
            return $true
        }
        else {
            Write-Log "ERROR: Failed to create realm '$RealmName': $($_.Exception.Message)"
            return $false
        }
    }
}

# Function to create client for frontend
function Create-Client {
    param($RealmName, $ClientId, $RedirectUris, $Token)

    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }

    $clientConfig = @{
        clientId = $ClientId
        enabled = $true
        publicClient = $true
        redirectUris = $RedirectUris
        webOrigins = @("*")
        protocol = "openid-connect"
        standardFlowEnabled = $true
        implicitFlowEnabled = $false
        directAccessGrantsEnabled = $true
    } | ConvertTo-Json -Depth 10

    try {
        Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$RealmName/clients" -Method Post -Body $clientConfig -Headers $headers
        Write-Log "Client '$ClientId' created successfully in realm '$RealmName'"
        return $true
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Log "Client '$ClientId' already exists in realm '$RealmName'"
            return $true
        }
        else {
            Write-Log "ERROR: Failed to create client '$ClientId' in realm '$RealmName': $($_.Exception.Message)"
            return $false
        }
    }
}

# Function to create test user
function Create-TestUser {
    param($RealmName, $Username, $Email, $Password, $Token)

    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }

    $userConfig = @{
        username = $Username
        email = $Email
        enabled = $true
        emailVerified = $true
        firstName = "Test"
        lastName = "User"
        credentials = @(
            @{
                type = "password"
                value = $Password
                temporary = $false
            }
        )
    } | ConvertTo-Json -Depth 10

    try {
        Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$RealmName/users" -Method Post -Body $userConfig -Headers $headers
        Write-Log "Test user '$Username' created successfully in realm '$RealmName'"
        return $true
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Log "Test user '$Username' already exists in realm '$RealmName'"
            return $true
        }
        else {
            Write-Log "ERROR: Failed to create test user '$Username' in realm '$RealmName': $($_.Exception.Message)"
            return $false
        }
    }
}

# Function to update realm SMTP settings
function Update-RealmSMTP {
    param($RealmName, $Token)

    $headers = @{
        "Authorization" = "Bearer $Token"
        "Content-Type" = "application/json"
    }

    $smtpConfig = @{
        smtpServer = @{
            host = "smtp.gmail.com"
            port = "587"
            from = "eugenenag@gmail.com"
            auth = "true"
            user = "eugenenag@gmail.com"
            password = "nnce xyhu ydsq vqxu"
            starttls = "true"
            ssl = "false"
        }
    } | ConvertTo-Json -Depth 10

    try {
        Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$RealmName" -Method Put -Body $smtpConfig -Headers $headers
        Write-Log "SMTP settings updated for realm '$RealmName'"
        return $true
    }
    catch {
        Write-Log "ERROR: Failed to update SMTP settings for realm '$RealmName': $($_.Exception.Message)"
        return $false
    }
}

# Main execution
Write-Log "Starting Keycloak configuration..."

# Wait for Keycloak to be ready
Write-Log "Waiting for Keycloak to be ready..."
do {
    try {
        $response = Invoke-WebRequest -Uri "$KEYCLOAK_URL/health/ready" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Log "Keycloak is ready"
            break
        }
    }
    catch {
        Write-Log "Keycloak not ready yet, waiting..."
        Start-Sleep -Seconds 5
    }
} while ($true)

# Get admin token
Write-Log "Getting admin access token..."
$token = Get-AdminToken
if (-not $token) {
    Write-Log "ERROR: Failed to get admin token. Exiting."
    exit 1
}

# Create realms
foreach ($realm in $REALMS) {
    Write-Log "Creating realm: $realm"
    $success = Create-Realm -RealmName $realm -Token $token

    if ($success) {
        # Update SMTP settings for the realm
        Update-RealmSMTP -RealmName $realm -Token $token

        # Create clients for each realm
        switch ($realm) {
            "AdminRealm" {
                Create-Client -RealmName $realm -ClientId "admin-frontend" -RedirectUris @("http://localhost:8080/*") -Token $token
                Create-TestUser -RealmName $realm -Username "admin@test.com" -Email "admin@test.com" -Password "admin123" -Token $token
            }
            "BuyerRealm" {
                Create-Client -RealmName $realm -ClientId "buyer-frontend" -RedirectUris @("http://localhost:8082/*") -Token $token
                Create-TestUser -RealmName $realm -Username "buyer@test.com" -Email "buyer@test.com" -Password "buyer123" -Token $token
            }
            "SellerRealm" {
                Create-Client -RealmName $realm -ClientId "seller-frontend" -RedirectUris @("http://localhost:8081/*") -Token $token
                Create-TestUser -RealmName $realm -Username "seller@test.com" -Email "seller@test.com" -Password "seller123" -Token $token
            }
        }
    }
}

Write-Log "Keycloak configuration completed!"
Write-Log "You can access the admin console at: $KEYCLOAK_URL/admin"
Write-Log "Admin credentials: $ADMIN_USERNAME / $ADMIN_PASSWORD"
Write-Log ""
Write-Log "Test users created:"
Write-Log "  AdminRealm: admin@test.com / admin123"
Write-Log "  BuyerRealm: buyer@test.com / buyer123"
Write-Log "  SellerRealm: seller@test.com / seller123"
Write-Log ""
Write-Log "Realm URLs:"
Write-Log "  AdminRealm: $KEYCLOAK_URL/realms/AdminRealm"
Write-Log "  BuyerRealm: $KEYCLOAK_URL/realms/BuyerRealm"
Write-Log "  SellerRealm: $KEYCLOAK_URL/realms/SellerRealm"
