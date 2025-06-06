# Seller Frontend

Business dashboard for wood product sellers in the Diplom project marketplace.

## 🎯 Purpose

The Seller Frontend provides a comprehensive business management interface for wood product sellers to manage their inventory, communicate with customers, track sales, and monitor their business performance.

## 🚀 Features

- **Business Dashboard**: Sales metrics, product statistics, and performance overview
- **Product Management**: Add, edit, and manage wood product inventory
- **Customer Communication**: Real-time chat with potential buyers
- **Profile Management**: Seller profile and business information
- **Analytics**: Business insights and sales tracking
- **System Integration**: Seamless backend API connectivity

## 🛠️ Technology Stack

- **React 18**: Modern React with hooks and functional components
- **React Router 6**: Client-side routing
- **Axios**: HTTP client for API communication
- **CSS3**: Custom styling with business-focused design
- **Docker**: Containerized deployment
- **Nginx**: Production web server

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker (for containerized deployment)
- Access to the backend API (port 8000)
- Seller account credentials

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

# Access at http://localhost:8081
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.js     # Business dashboard
│   ├── Products.js      # Product management
│   ├── Chats.js         # Customer communication
│   ├── Profile.js       # Seller profile
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

# Business Tools
make mock-data       # Generate mock seller data
make test-api        # Test API connectivity
make validate-seller # Validate seller configuration

# Maintenance
make clean           # Clean build artifacts
make audit           # Security audit
make info            # Show project info
```

## 🌐 API Integration

The seller frontend communicates with the backend API at:
- Development: `http://localhost:8000`
- Production: Configured via `REACT_APP_API_URL`

### API Endpoints Used

- `GET /api/v1/health` - System health check
- `GET /api/v1/sellers/{id}` - Get seller profile
- `PATCH /api/v1/sellers/{id}` - Update seller profile
- `GET /api/v1/products` - List seller products
- `POST /api/v1/products` - Create new product
- `PATCH /api/v1/products/{id}` - Update product
- `DELETE /api/v1/products/{id}` - Delete product
- `GET /api/v1/wood-types` - List wood types
- `GET /api/v1/chat-threads` - List customer chats
- `GET /api/v1/chat-messages` - Get chat messages
- `POST /api/v1/chat-messages` - Send message

## 🏪 Business Features

### Product Management
- **Add Products**: Create new wood product listings
- **Edit Products**: Update product details and pricing
- **Delete Products**: Remove products from inventory
- **Wood Types**: Select from available wood types
- **Pricing**: Set competitive prices per cubic meter

### Customer Communication
- **Chat System**: Real-time messaging with buyers
- **Thread Management**: Organize conversations by customer
- **Message History**: Complete conversation records
- **Response Tracking**: Monitor communication efficiency

### Business Analytics
- **Sales Metrics**: Track total products and volume
- **Revenue Tracking**: Monitor total business value
- **Customer Insights**: Analyze chat and inquiry patterns
- **Performance Dashboard**: Key business indicators

## 🎨 UI/UX Features

- **Business-Focused Design**: Professional seller interface
- **Responsive Layout**: Works on all devices
- **Intuitive Navigation**: Easy access to all features
- **Real-time Updates**: Live data synchronization
- **Loading States**: Visual feedback for operations
- **Error Handling**: Comprehensive error management

## 🔧 Configuration

### Environment Variables

```bash
REACT_APP_API_URL=http://localhost:8000  # Backend API URL
NODE_ENV=development                      # Environment mode
```

### Mock Data Configuration

The application uses a mock seller ID for development:
```javascript
const MOCK_SELLER_ID = '3ab0f210-ca78-4312-841b-8b1ae774adac';
```

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

## 🔒 Security Features

- Input validation for all forms
- Secure API communication
- XSS protection
- CORS compliance
- Secure Docker configuration
- Environment variable protection

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Problems**
   - Verify backend is running on port 8000
   - Check seller authentication
   - Confirm network connectivity

2. **Product Creation Failures**
   - Ensure all required fields are filled
   - Verify wood type selection
   - Check numeric field validation

3. **Chat Loading Issues**
   - Confirm seller ID configuration
   - Check chat thread permissions
   - Verify message API endpoints

### Health Checks

```bash
make health-check      # Check development server
make health-check-prod # Check production server
make test-api          # Test backend connectivity
```

## 📊 Performance Optimization

- **Lazy Loading**: Components loaded on demand
- **API Caching**: Efficient data management
- **Bundle Optimization**: Minimal production build
- **Image Optimization**: Compressed assets
- **Network Efficiency**: Optimized API calls

## 🤝 Business Workflow

1. **Setup Profile**: Configure seller information
2. **Add Products**: Create wood product listings
3. **Manage Inventory**: Update products and pricing
4. **Respond to Inquiries**: Chat with potential buyers
5. **Track Performance**: Monitor business metrics
6. **Optimize Listings**: Improve product visibility

## 📈 Analytics & Insights

- **Product Performance**: Track popular products
- **Customer Engagement**: Monitor chat activity
- **Revenue Trends**: Analyze sales patterns
- **Market Position**: Compare with marketplace trends

## 🤝 Contributing

1. Follow React and business logic best practices
2. Implement proper form validation
3. Add comprehensive error handling
4. Test all business workflows
5. Maintain clean, readable code
6. Document business logic

## 📝 License

Part of the Diplom project - Wood Products Marketplace.

## 🆘 Support

For business and technical support:
1. Check the troubleshooting section
2. Review API documentation
3. Test connectivity with health checks
4. Verify seller configuration
