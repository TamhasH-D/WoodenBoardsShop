# Deployment Guide for Diplom Project

## 🚀 Quick Deployment

### Local Development
```bash
# Start all services in development mode
./ci/scripts/start-all.sh --dev

# Start all services in production mode
./ci/scripts/start-all.sh

# Rebuild and start
./ci/scripts/start-all.sh --rebuild
```

### GitLab CI/CD Deployment
```bash
# Automatic on push to dev (staging)
git push origin dev

# Manual production deployment
# Go to GitLab UI -> Pipelines -> Run Pipeline on main branch
```

## 🔧 Environment Configuration

### Production Environment Variables

Create production `.env` file:
```bash
# Backend
BACKEND_DEBUG=False
BACKEND_LOG_LEVEL=info
BACKEND_WORKERS=4
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

# Database
BACKEND_PG_HOST=your-postgres-host
BACKEND_PG_PASSWORD=secure-password
BACKEND_PG_DATABASE=diplom_prod

# Frontend URLs
FRONTEND_ADMIN_API_URL=https://api.yourdomain.com/
FRONTEND_SELLER_API_URL=https://api.yourdomain.com/
FRONTEND_BUYER_API_URL=https://api.yourdomain.com/

# Security
BACKEND_CORS_ALLOW_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

### CI Environment Variables

The CI uses optimized configuration from `ci/config/.env.ci`:
- Test database settings
- Container networking
- Reduced resource usage
- Debug modes disabled

## 🐳 Deployment Options

### Option 1: Single Server with Docker Compose (Recommended)

```bash
# On production server
git clone <repository>
cd diplom

# Setup environment
cp .env.example .env
# Edit .env with production values

# Deploy
make up-prod

# Monitor
make logs
make health-check
```

### Option 2: Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yaml diplom

# Scale services
docker service scale diplom_admin-frontend=3
docker service scale diplom_seller-frontend=2
docker service scale diplom_buyer-frontend=3
```

### Option 3: Kubernetes

```bash
# Convert compose to k8s manifests
kompose convert -f docker-compose.yaml

# Apply to cluster
kubectl apply -f .

# Scale deployments
kubectl scale deployment admin-frontend --replicas=3
```

## 🔒 SSL/TLS Setup

### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/diplom
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Admin interface
    location /admin/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Seller interface
    location /seller/ {
        proxy_pass http://localhost:8081/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Buyer interface (main site)
    location / {
        proxy_pass http://localhost:8082/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Traefik (Alternative)

```yaml
# docker-compose.traefik.yml
version: '3.8'
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=your-email@domain.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./acme.json:/acme.json
    labels:
      - "traefik.http.routers.api.rule=Host(`traefik.yourdomain.com`)"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
```

## 📊 Monitoring and Logging

### Health Checks
```bash
# Automated health checks
make health-check

# Manual checks
curl https://yourdomain.com/api/health
curl https://yourdomain.com/admin/
curl https://yourdomain.com/seller/
curl https://yourdomain.com/
```

### Logging Setup

```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  backend-api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        
  # ELK Stack for centralized logging
  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    
  logstash:
    image: logstash:8.8.0
    depends_on:
      - elasticsearch
      
  kibana:
    image: kibana:8.8.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

### Prometheus Monitoring

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'diplom-backend'
    static_configs:
      - targets: ['backend-api:8000']
  
  - job_name: 'diplom-frontend'
    static_configs:
      - targets: ['admin-frontend:80', 'seller-frontend:80', 'buyer-frontend:80']
```

## 🔄 GitLab CI/CD Integration

### Pipeline Variables

Set in GitLab Project Settings > CI/CD > Variables:

```bash
# Docker Registry
DOCKER_REGISTRY_URL=registry.gitlab.com
DOCKER_REGISTRY_USERNAME=$CI_REGISTRY_USER
DOCKER_REGISTRY_PASSWORD=$CI_REGISTRY_PASSWORD

# Staging Environment
STAGING_SERVER_HOST=staging.yourdomain.com
STAGING_SERVER_USER=deploy
STAGING_SSH_KEY=<base64-encoded-private-key>

# Production Environment
PRODUCTION_SERVER_HOST=yourdomain.com
PRODUCTION_SERVER_USER=deploy
PRODUCTION_SSH_KEY=<base64-encoded-private-key>

# Database
PRODUCTION_DB_PASSWORD=<secure-password>
STAGING_DB_PASSWORD=<secure-password>
```

### Deployment Scripts

The pipeline uses these deployment patterns:

```bash
# Staging deployment (automatic on dev push)
- docker compose pull
- docker compose up -d
- docker compose exec backend-api python manage.py migrate

# Production deployment (manual trigger)
- docker compose pull
- docker compose up -d --no-deps backend-api
- docker compose exec backend-api python manage.py migrate
- docker compose up -d
```

## 🛡️ Security Considerations

### Database Security
```bash
# Use strong passwords
BACKEND_PG_PASSWORD=$(openssl rand -base64 32)

# Enable SSL connections
BACKEND_PG_SSLMODE=require

# Network isolation
# Place database in private network
```

### Application Security
```bash
# Environment variables for secrets
BACKEND_SECRET_KEY=$(openssl rand -base64 32)
JWT_SECRET_KEY=$(openssl rand -base64 32)

# CORS configuration
BACKEND_CORS_ALLOW_ORIGINS=https://yourdomain.com

# Rate limiting
BACKEND_RATE_LIMIT=100/minute
```

### Infrastructure Security
```bash
# Firewall rules
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw deny 8000/tcp   # Block direct backend access

# Regular updates
apt update && apt upgrade -y
docker system prune -f
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale frontend services
docker compose up --scale admin-frontend=3
docker compose up --scale seller-frontend=2
docker compose up --scale buyer-frontend=3

# Scale backend with load balancer
docker compose up --scale backend-api=2
```

### Load Balancing
```yaml
# docker-compose.lb.yml
services:
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - admin-frontend
      - seller-frontend
      - buyer-frontend
      - backend-api
```

## 🔧 Troubleshooting

### Common Deployment Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :8000
   
   # Change ports in .env
   BACKEND_PORT=8001
   ```

2. **Memory Issues**
   ```bash
   # Check memory usage
   docker stats
   
   # Increase swap space
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

3. **SSL Certificate Issues**
   ```bash
   # Check certificate validity
   openssl x509 -in cert.pem -text -noout
   
   # Renew Let's Encrypt certificates
   certbot renew
   ```

### Debug Commands
```bash
# Container inspection
docker compose ps
docker compose logs service-name
docker compose exec service-name bash

# Resource monitoring
docker stats
docker system df
docker system events

# Network debugging
docker network ls
docker network inspect diplom_default
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Update environment variables
- [ ] Test locally with production config: `make test-ci`
- [ ] Backup existing data
- [ ] Check resource requirements
- [ ] Verify SSL certificates
- [ ] Review security settings

### Deployment
- [ ] Pull latest code
- [ ] Build containers: `make build-prod`
- [ ] Run database migrations
- [ ] Start services: `make up-prod`
- [ ] Verify health checks: `make health-check`
- [ ] Test critical functionality

### Post-deployment
- [ ] Monitor logs: `make logs`
- [ ] Check performance metrics
- [ ] Verify all services accessible
- [ ] Update documentation
- [ ] Notify stakeholders
- [ ] Schedule backup verification

## 🆘 Rollback Procedure

### Quick Rollback
```bash
# Stop current deployment
make down

# Restore previous version
git checkout previous-tag
make up-prod

# Or use previous images
docker compose pull
docker compose up -d
```

### Database Rollback
```bash
# Restore database backup
docker compose exec postgres psql -U backend -d backend < backup.sql

# Or restore from volume backup
docker run --rm -v diplom_postgres-data:/data -v $(pwd):/backup alpine \
  tar -xzf /backup/postgres-backup.tar.gz -C /data
```
