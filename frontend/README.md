# Frontend Microservices

Comprehensive frontend ecosystem for the Diplom project wood products marketplace.

## 🏗️ Architecture Overview

The frontend consists of three specialized React microservices, each serving different user roles:

- **Admin Frontend** (Port 8080): Administrative dashboard for system management
- **Seller Frontend** (Port 8081): Business dashboard for wood product sellers  
- **Buyer Frontend** (Port 8082): Customer marketplace for wood product buyers

## 🎯 Microservices

### 🔧 Admin Frontend
**Purpose**: System administration and monitoring
- User management (buyers and sellers)
- Product oversight and moderation
- Chat thread monitoring
- System health and analytics
- Backend service monitoring

### 🏪 Seller Frontend  
**Purpose**: Business management for sellers
- Product inventory management
- Customer communication via chat
- Sales analytics and insights
- Profile and business information
- Order and inquiry management

### 🛍️ Buyer Frontend
**Purpose**: Customer marketplace experience
- Product browsing and search
- AI-powered board volume analysis
- Seller discovery and communication
- Shopping cart and wishlist
- User profile and preferences

## 🛠️ Technology Stack

### Common Technologies
- **React 18**: Modern React with hooks and functional components
- **React Router 6**: Client-side routing for SPAs
- **Axios**: HTTP client for API communication
- **CSS3**: Custom responsive styling
- **Docker**: Containerized deployment
- **Nginx**: Production web server

### Development Tools
- **Node.js 18+**: JavaScript runtime
- **npm**: Package management
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework

## 🚀 Quick Start

### All Microservices

```bash
# Install all dependencies
make install-all

# Build all frontends
make build-all

# Start all in development mode
make dev-all

# Run all with Docker
make docker-build-all
make docker-run-all
```

### Individual Microservices

```bash
# Admin Frontend
cd admin && make start    # http://localhost:3000

# Seller Frontend  
cd seller && make start   # http://localhost:3000

# Buyer Frontend
cd buyer && make start    # http://localhost:3000
```

## 📁 Project Structure

```
frontend/
├── admin/                  # Admin microservice
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   └── ...
│   ├── Dockerfile
│   ├── Makefile
│   └── package.json
├── seller/                 # Seller microservice
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   └── ...
│   ├── Dockerfile
│   ├── Makefile
│   └── package.json
├── buyer/                  # Buyer microservice
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   └── ...
│   ├── Dockerfile
│   ├── Makefile
│   └── package.json
├── Makefile               # Global frontend management
└── README.md              # This file
```

## 🔧 Available Commands

### Global Commands (from frontend/ directory)

```bash
# Development
make install-all         # Install all dependencies
make build-all          # Build all frontends
make test-all           # Test all frontends
make lint-all           # Lint all frontends
make clean-all          # Clean all frontends

# Docker
make docker-build-all   # Build all Docker images
make docker-run-all     # Run all containers
make docker-stop-all    # Stop all containers
make docker-clean-all   # Clean all Docker resources

# Maintenance
make audit-all          # Security audit all
make health-check-all   # Health check all services
make info-all           # Show info for all

# CI/CD
make ci-install-all     # CI install all
make ci-build-all       # CI build all
make ci-test-all        # CI test all
make ci-lint-all        # CI lint all
```

### Individual Commands (from each microservice directory)

```bash
make help               # Show available commands
make install            # Install dependencies
make start              # Start development server
make build              # Build production bundle
make test               # Run tests
make lint               # Run linting
make docker-build       # Build Docker image
make docker-run         # Run Docker container
make clean              # Clean artifacts
make audit              # Security audit
```

## 🌐 API Integration

All frontends communicate with the backend API:
- **Development**: `http://localhost:8000`
- **Production**: Configured via `REACT_APP_API_URL`

### Common API Endpoints
- `GET /api/v1/health` - System health check
- `GET /api/v1/products` - Product listings
- `GET /api/v1/sellers` - Seller directory
- `GET /api/v1/buyers` - Buyer management
- `GET /api/v1/wood-types` - Wood type catalog
- `GET /api/v1/chat-threads` - Communication threads
- `GET /api/v1/chat-messages` - Chat messages

## 🔒 Security Features

### Common Security Measures
- **Input Validation**: All user inputs validated
- **XSS Protection**: Cross-site scripting prevention
- **CORS Configuration**: Proper cross-origin setup
- **Secure Headers**: Security headers in production
- **Environment Variables**: Secure configuration management

### Docker Security
- **Multi-stage Builds**: Minimal production images
- **Non-root Users**: Secure container execution
- **Minimal Base Images**: Alpine Linux for security
- **Health Checks**: Container health monitoring

## 🚀 Deployment

### Development Environment

```bash
# Quick setup all frontends
make setup-all

# Start individual services
make start-admin         # Port 3000
make start-seller        # Port 3000  
make start-buyer         # Port 3000
```

### Production Environment

```bash
# Build and deploy all
make build-all
make docker-build-all
make docker-run-all

# Access services
# Admin:  http://localhost:8080
# Seller: http://localhost:8081
# Buyer:  http://localhost:8082
```

### CI/CD Pipeline

```bash
# Complete CI/CD workflow
make ci-install-all
make ci-lint-all
make ci-test-all
make ci-build-all
```

## 🔧 Configuration

### Environment Variables

Each microservice supports:
```bash
REACT_APP_API_URL=http://localhost:8000  # Backend API URL
NODE_ENV=development                      # Environment mode
```

### Docker Configuration

Production ports:
- **Admin**: 8080
- **Seller**: 8081  
- **Buyer**: 8082

## 📊 Performance Optimization

### Build Optimization
- **Code Splitting**: Lazy loading of components
- **Bundle Analysis**: Optimized bundle sizes
- **Tree Shaking**: Unused code elimination
- **Compression**: Gzip compression in production

### Runtime Optimization
- **Caching**: Efficient API response caching
- **Lazy Loading**: On-demand component loading
- **Image Optimization**: Compressed and responsive images
- **Service Workers**: Offline functionality

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   ```bash
   make test-api           # Test API connectivity
   make health-check-all   # Check all services
   ```

2. **Build Failures**
   ```bash
   make clean-all          # Clean all artifacts
   make install-all        # Reinstall dependencies
   ```

3. **Docker Issues**
   ```bash
   make docker-clean-all   # Clean Docker resources
   make docker-build-all   # Rebuild images
   ```

### Health Monitoring

```bash
make health-check-all      # Check all services
make validate-microservices # Validate configurations
```

## 🤝 Development Guidelines

### Code Standards
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations
- Follow React best practices
- Write clean, readable code

### Testing Requirements
- Unit tests for components
- Integration tests for API calls
- End-to-end testing for workflows
- Performance testing for optimization

### Documentation
- Component documentation
- API integration guides
- Deployment instructions
- Troubleshooting guides

## 📈 Monitoring & Analytics

### Performance Metrics
- Bundle size analysis
- Load time monitoring
- API response times
- User interaction tracking

### Business Metrics
- User engagement
- Conversion rates
- Feature usage
- Error rates

## 🤝 Contributing

1. Follow the established architecture patterns
2. Maintain microservice independence
3. Implement comprehensive error handling
4. Add proper testing coverage
5. Document all changes
6. Follow security best practices

## 📝 License

Part of the Diplom project - Wood Products Marketplace.

## 🆘 Support

For technical support:
1. Check individual microservice README files
2. Review troubleshooting sections
3. Test API connectivity
4. Verify Docker configuration
5. Check environment variables
