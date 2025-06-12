# Admin Frontend

Administrative dashboard for the Diplom project wood products marketplace.

## 🎯 Purpose

The Admin Frontend provides comprehensive administrative capabilities for managing the entire marketplace ecosystem, including users, products, sellers, buyers, and system monitoring.

## 🚀 Features

- **Dashboard Overview**: System health monitoring and key metrics
- **User Management**: Manage buyers and sellers
- **Product Management**: Oversee all marketplace products
- **Chat Monitoring**: Monitor customer-seller communications
- **System Health**: Backend connectivity and service status monitoring
- **Real-time Updates**: Live data from the backend API

## 🛠️ Technology Stack

- **React 18**: Modern React with hooks and functional components
- **React Router 6**: Client-side routing
- **Axios**: HTTP client for API communication
- **CSS3**: Custom styling with responsive design
- **Docker**: Containerized deployment
- **Nginx**: Production web server

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker (for containerized deployment)
- Access to the backend API (port 8000)

## 🏃‍♂️ Quick Start

### Development

```bash
# Install dependencies
make install

# Start development server
make start

# Open http://localhost:3000
```

### Production

```bash
# Build production bundle
make build

# Run with Docker
make docker-build
make docker-run

# Access at http://localhost:8080
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.js     # Main dashboard
│   ├── Buyers.js        # Buyer management
│   ├── Sellers.js       # Seller management
│   ├── Products.js      # Product management
│   ├── ChatThreads.js   # Chat monitoring
│   └── HealthCheck.js   # System health
├── services/
│   └── api.js          # API service layer
├── hooks/
│   └── useApi.js       # Custom React hooks
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Global styles
```

## 🔧 Available Commands

```bash
# Development
make install          # Install dependencies
make start           # Start development server
make build           # Build production bundle

# Testing
make test            # Run tests
make test-coverage   # Run tests with coverage
make lint            # Run linting

# Docker
make docker-build    # Build Docker image
make docker-run      # Run Docker container
make docker-stop     # Stop Docker container

# Maintenance
make clean           # Clean build artifacts
make audit           # Security audit
make info            # Show project info
```

## 🌐 API Integration

The admin frontend communicates with the backend API at:
- Development: `http://localhost:8000`
- Production: Configured via `REACT_APP_API_URL`

### API Endpoints Used

- `GET /api/v1/health` - System health check
- `GET /api/v1/buyers` - List buyers
- `GET /api/v1/sellers` - List sellers
- `GET /api/v1/products` - List products
- `GET /api/v1/chat-threads` - List chat threads
- `DELETE /api/v1/buyers/{id}` - Delete buyer
- `DELETE /api/v1/sellers/{id}` - Delete seller
- `DELETE /api/v1/products/{id}` - Delete product

## 🔒 Security Features

- Input validation and sanitization
- CORS protection
- XSS protection headers
- Content Security Policy
- Secure Docker configuration

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Interface**: Minimalist design focused on functionality
- **Loading States**: Visual feedback for all operations
- **Error Handling**: Comprehensive error messages and recovery
- **Navigation**: Intuitive menu and routing
- **Real-time Updates**: Live data refresh capabilities

## 🔧 Configuration

### Environment Variables

```bash
REACT_APP_API_URL=http://localhost:8000  # Backend API URL
NODE_ENV=development                      # Environment mode
```

### Docker Configuration

- **Port**: 8080 (production)
- **Base Image**: nginx:alpine
- **Build**: Multi-stage build for optimization

## 🚀 Deployment

### Development Deployment

```bash
make setup           # Complete setup
make start           # Start development server
```

### Production Deployment

```bash
make build           # Build production bundle
make docker-build    # Build Docker image
make docker-run      # Deploy container
```

### CI/CD Integration

```bash
make ci-install      # CI dependency installation
make ci-build        # CI build process
make ci-test         # CI testing
make ci-lint         # CI linting
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure backend API is running on port 8000
   - Check CORS configuration
   - Verify network connectivity

2. **Build Failures**
   - Clear node_modules: `make clean`
   - Reinstall dependencies: `make install`
   - Check Node.js version compatibility

3. **Docker Issues**
   - Ensure Docker is running
   - Check port availability (8080)
   - Review Docker logs: `docker logs admin-frontend`

### Health Checks

```bash
make health-check      # Check development server
make health-check-prod # Check production server
```

## 📊 Performance

- **Bundle Size**: Optimized for minimal size
- **Loading Time**: Fast initial load with code splitting
- **Memory Usage**: Efficient React component lifecycle
- **Network**: Optimized API calls with caching

## 🤝 Contributing

1. Follow React best practices
2. Use functional components with hooks
3. Implement proper error handling
4. Add loading states for async operations
5. Write clean, readable code
6. Test all functionality

## 📝 License

Part of the Diplom project - Wood Products Marketplace.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review backend API documentation
3. Check Docker and network configuration
4. Verify environment variables
