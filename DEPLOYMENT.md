# Deployment Guide

This guide covers deployment options for the Diplom project.

## 🚀 Quick Deployment

### Local Development
```bash
# Start all services in development mode
./scripts/start-all.sh --dev

# Start all services in production mode
./scripts/start-all.sh

# Rebuild and start
./scripts/start-all.sh --rebuild
```

### Production Deployment Options

#### Option 1: Docker Compose (Recommended for single server)
```bash
# On production server
git clone <repository>
cd diplom
cp .env.example .env
# Edit .env with production values
make up-prod
```

#### Option 2: Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yaml diplom

# Scale services
docker service scale diplom_admin-frontend=3
```

#### Option 3: Kubernetes
```bash
# Convert compose to k8s manifests
kompose convert

# Apply to cluster
kubectl apply -f .
```

## 🔧 Production Configuration

### Environment Variables
Update `.env` for production:

```bash
# Backend
BACKEND_DEBUG=False
BACKEND_LOG_LEVEL=info
BACKEND_WORKERS=4

# Database
BACKEND_PG_HOST=your-postgres-host
BACKEND_PG_PASSWORD=secure-password

# Frontend URLs
FRONTEND_ADMIN_API_URL=https://api.yourdomain.com/
FRONTEND_SELLER_API_URL=https://api.yourdomain.com/
FRONTEND_BUYER_API_URL=https://api.yourdomain.com/
```

### SSL/TLS Setup
Add reverse proxy (nginx/traefik) for HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /api/ {
        proxy_pass http://localhost:8000/;
    }
    
    location / {
        proxy_pass http://localhost:8080/;
    }
}
```

## 📊 Monitoring

### Health Checks
```bash
# Check all services
make health-check

# Individual service health
curl http://localhost:8000/health
curl http://localhost:8080/
```

### Logging
```bash
# View all logs
make logs

# Follow specific service
docker compose logs -f backend-api
```

### Metrics
Consider adding:
- Prometheus for metrics
- Grafana for dashboards
- ELK stack for log aggregation

## 🔄 CI/CD Integration

### GitHub Actions
The project includes GitHub Actions workflows:
- `.github/workflows/ci-cd.yml` - Main pipeline
- `.github/workflows/dev-test.yml` - Development testing

### Deployment Triggers
- **Development**: Auto-deploy on push to `dev` branch
- **Production**: Manual approval for `main` branch

### Secrets Configuration
Add these secrets to your GitHub repository:
```
DOCKER_REGISTRY_URL
DOCKER_REGISTRY_USERNAME
DOCKER_REGISTRY_PASSWORD
PRODUCTION_SERVER_HOST
PRODUCTION_SERVER_USER
PRODUCTION_SERVER_SSH_KEY
```

## 🛡️ Security Considerations

### Database Security
- Use strong passwords
- Enable SSL connections
- Regular backups
- Network isolation

### Application Security
- Update dependencies regularly
- Use environment variables for secrets
- Enable CORS properly
- Implement rate limiting

### Infrastructure Security
- Firewall configuration
- Regular security updates
- Access logging
- Intrusion detection

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale frontend services
docker compose up --scale admin-frontend=3
docker compose up --scale seller-frontend=2
docker compose up --scale buyer-frontend=3

# Scale backend
docker compose up --scale backend-api=2
```

### Load Balancing
Add load balancer configuration:
```yaml
# docker-compose.lb.yml
services:
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - admin-frontend
      - seller-frontend
      - buyer-frontend
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :8000
   
   # Change ports in .env
   BACKEND_PORT=8001
   ```

2. **Memory issues**
   ```bash
   # Check memory usage
   docker stats
   
   # Increase memory limits
   docker compose --compatibility up
   ```

3. **Network connectivity**
   ```bash
   # Check networks
   docker network ls
   
   # Inspect network
   docker network inspect diplom_default
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
docker system prune
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Update environment variables
- [ ] Test locally with production config
- [ ] Backup existing data
- [ ] Check resource requirements
- [ ] Verify SSL certificates

### Deployment
- [ ] Pull latest code
- [ ] Build containers
- [ ] Run database migrations
- [ ] Start services
- [ ] Verify health checks
- [ ] Test critical functionality

### Post-deployment
- [ ] Monitor logs for errors
- [ ] Check performance metrics
- [ ] Verify all services accessible
- [ ] Update documentation
- [ ] Notify stakeholders

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
docker volume create --name postgres-backup
docker run --rm -v postgres-backup:/backup -v diplom_postgres-data:/data alpine tar -xzf /backup/postgres-backup.tar.gz -C /data
```

## 📞 Support

For deployment issues:
1. Check logs: `make logs`
2. Verify configuration: `make health-check`
3. Review documentation
4. Contact development team
