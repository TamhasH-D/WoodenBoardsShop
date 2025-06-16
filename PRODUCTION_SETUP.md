# 🌐 Production Setup Guide

## Domain Configuration

### Required Domains
Configure the following domains to point to your server:

```
admin.taruman.ru    → Server IP:8080
seller.taruman.ru   → Server IP:8081  
buyer.taruman.ru    → Server IP:8082
api.taruman.ru      → Server IP:8000
keycloak.taruman.ru → Server IP:8030
```

### DNS Records
Add these A records to your DNS:

```
admin.taruman.ru    A    YOUR_SERVER_IP
seller.taruman.ru   A    YOUR_SERVER_IP
buyer.taruman.ru    A    YOUR_SERVER_IP
api.taruman.ru      A    YOUR_SERVER_IP
keycloak.taruman.ru A    YOUR_SERVER_IP
```

## Server Configuration

### 1. Firewall Rules
Open the required ports:

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow application ports
sudo ufw allow 8000  # API
sudo ufw allow 8030  # Keycloak
sudo ufw allow 8080  # Admin Frontend
sudo ufw allow 8081  # Seller Frontend  
sudo ufw allow 8082  # Buyer Frontend
```

### 2. Reverse Proxy (Nginx)
Create nginx configuration for SSL termination:

```nginx
# /etc/nginx/sites-available/taruman.ru
server {
    listen 80;
    server_name admin.taruman.ru seller.taruman.ru buyer.taruman.ru api.taruman.ru keycloak.taruman.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.taruman.ru;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name seller.taruman.ru;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name buyer.taruman.ru;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.taruman.ru;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name keycloak.taruman.ru;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:8030;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. SSL Certificate
Get SSL certificate using Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d admin.taruman.ru -d seller.taruman.ru -d buyer.taruman.ru -d api.taruman.ru -d keycloak.taruman.ru
```

## Deployment

### 1. Environment Setup
The `.env` file is already configured for production domains.

### 2. Deploy Application
```bash
# Stop development containers
docker-compose down

# Deploy production
docker-compose -f docker-compose.prod.yaml up -d --build
```

### 3. Verify Deployment
Check that all services are running:

```bash
docker ps
```

Test domains:
- https://admin.taruman.ru
- https://seller.taruman.ru  
- https://buyer.taruman.ru
- https://api.taruman.ru/health
- https://keycloak.taruman.ru

## Features

### Universal Authentication
- ✅ Works with production domains automatically
- ✅ HTTPS support with SSL termination
- ✅ Keycloak configured with wildcard redirects
- ✅ Dynamic URL generation based on environment

### Test Credentials
- **Admin**: admin@test.com / admin123
- **Seller**: seller@test.com / seller123
- **Buyer**: buyer@test.com / buyer123

## Monitoring

### Health Checks
- API: https://api.taruman.ru/health
- Keycloak: https://keycloak.taruman.ru/health

### Logs
```bash
# View all logs
docker-compose -f docker-compose.prod.yaml logs -f

# View specific service
docker logs buyer-frontend-prod -f
```

## Troubleshooting

### Domain Not Resolving
1. Check DNS propagation: `nslookup admin.taruman.ru`
2. Verify A records point to correct IP
3. Wait for DNS propagation (up to 24 hours)

### SSL Issues
1. Check certificate: `sudo certbot certificates`
2. Renew if needed: `sudo certbot renew`
3. Restart nginx: `sudo systemctl restart nginx`

### Authentication Issues
1. Check Keycloak logs: `docker logs keycloak-prod`
2. Verify redirect URIs in Keycloak admin console
3. Check browser network tab for CORS errors
