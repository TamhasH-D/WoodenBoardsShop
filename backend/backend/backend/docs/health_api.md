# Health Check API Documentation

## 🏥 System Health Monitoring

The Health Check API provides comprehensive system monitoring capabilities for the Wood Trading Marketplace backend. This endpoint is essential for monitoring service availability, performance metrics, and system diagnostics.

## 📋 Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/health` | System health status | No |

---

## 🔍 GET /health

**Check system health and service availability**

### Request

```http
GET /api/v1/health HTTP/1.1
Host: localhost:8000
```

### Response

#### Success Response (200 OK)

```json
{
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T12:00:00Z",
    "version": "1.0.0",
    "uptime": 3600.5,
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "yolo_backend": "healthy"
    },
    "system_info": {
      "environment": "development",
      "python_version": "3.11.0",
      "fastapi_version": "0.104.1"
    }
  }
}
```

#### Service Unavailable (503)

```json
{
  "data": {
    "status": "unhealthy",
    "timestamp": "2024-01-01T12:00:00Z",
    "version": "1.0.0",
    "uptime": 3600.5,
    "services": {
      "database": "unhealthy",
      "redis": "healthy",
      "yolo_backend": "timeout"
    },
    "errors": [
      "Database connection failed",
      "YOLO service timeout"
    ]
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Overall system status: `healthy`, `degraded`, `unhealthy` |
| `timestamp` | datetime | ISO 8601 timestamp of health check |
| `version` | string | API version number |
| `uptime` | float | System uptime in seconds |
| `services` | object | Individual service health status |
| `system_info` | object | System environment information |
| `errors` | array | List of error messages (if any) |

### Service Status Values

- **`healthy`**: Service is fully operational
- **`degraded`**: Service is operational but with reduced performance
- **`unhealthy`**: Service is not responding or failing
- **`timeout`**: Service request timed out

## 🧪 Testing Examples

### cURL

```bash
# Basic health check
curl -X GET "http://localhost:8000/api/v1/health"

# Health check with verbose output
curl -v -X GET "http://localhost:8000/api/v1/health"

# Health check with timeout
curl --max-time 5 -X GET "http://localhost:8000/api/v1/health"
```

### JavaScript/Fetch

```javascript
// Basic health check
async function checkHealth() {
  try {
    const response = await fetch('http://localhost:8000/api/v1/health');
    const health = await response.json();

    if (health.data.status === 'healthy') {
      console.log('✅ System is healthy');
      console.log(`Uptime: ${health.data.uptime} seconds`);
    } else {
      console.log('⚠️ System has issues:', health.data.errors);
    }

    return health.data;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return null;
  }
}

// Continuous monitoring
setInterval(checkHealth, 30000); // Check every 30 seconds
```

### Python/Requests

```python
import requests
import time

def check_system_health():
    """Check system health and return status"""
    try:
        response = requests.get(
            'http://localhost:8000/api/v1/health',
            timeout=5
        )
        health_data = response.json()['data']

        if health_data['status'] == 'healthy':
            print(f"✅ System healthy - Uptime: {health_data['uptime']}s")
            return True
        else:
            print(f"⚠️ System issues: {health_data.get('errors', [])}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False

# Monitor system health
while True:
    check_system_health()
    time.sleep(30)
```

## 📊 Monitoring Integration

### Prometheus Metrics

The health endpoint can be integrated with monitoring systems:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'wood-trading-api'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/api/v1/health'
    scrape_interval: 30s
```

### Docker Health Check

```dockerfile
# Dockerfile health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1
```

### Kubernetes Liveness Probe

```yaml
# k8s deployment
livenessProbe:
  httpGet:
    path: /api/v1/health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

## 🚨 Status Codes

| Code | Status | Description |
|------|--------|-------------|
| `200` | OK | System is healthy and all services operational |
| `503` | Service Unavailable | System or critical services are unhealthy |
| `500` | Internal Server Error | Unexpected error during health check |

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database container
   docker ps | grep postgres
   docker logs backend-pg
   ```

2. **Redis Connection Failed**
   ```bash
   # Check Redis container
   docker ps | grep redis
   docker logs backend-redis
   ```

3. **YOLO Service Timeout**
   ```bash
   # Check YOLO services
   curl http://localhost:8001/health
   curl http://localhost:8002/health
   ```

### Health Check Debugging

```bash
# Detailed service logs
make backend-logs

# Check all container status
make ps

# Restart unhealthy services
make down && make up
```

---

**Endpoint Documentation Version**: 2.0
**Last Updated**: December 2024