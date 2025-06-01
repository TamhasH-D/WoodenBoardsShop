# Buyer Frontend

Customer-facing marketplace for wood product buyers in the Diplom project.

## 🎯 Purpose

The Buyer Frontend provides a comprehensive e-commerce experience for customers looking to purchase wood products. It features product browsing, seller discovery, AI-powered board analysis, and direct communication with sellers.

## 🚀 Features

- **Product Marketplace**: Browse and search wood products
- **Seller Directory**: Find and connect with verified sellers
- **AI Board Analyzer**: Upload images for volume estimation
- **Smart Search**: Find products by various criteria
- **Direct Communication**: Chat with sellers about products
- **User Profile**: Manage buyer account and preferences
- **System Health**: Monitor marketplace availability

## 🛠️ Technology Stack

- **React 18**: Modern React with hooks and functional components
- **React Router 6**: Client-side routing
- **Axios**: HTTP client for API communication
- **CSS3**: Customer-focused responsive design
- **Docker**: Containerized deployment
- **Nginx**: Production web server

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker (for containerized deployment)
- Access to the backend API (port 8000)
- Modern web browser with JavaScript enabled

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

# Access at http://localhost:8082
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Home.js          # Homepage with featured products
│   ├── Products.js      # Product browsing and search
│   ├── Sellers.js       # Seller directory
│   ├── BoardAnalyzer.js # AI-powered board analysis
│   ├── Profile.js       # Buyer profile management
│   └── HealthCheck.js   # System status
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

# E-commerce Tools
make mock-products   # Generate mock product data
make test-api        # Test API connectivity
make test-board-analyzer # Test board analyzer
make validate-buyer  # Validate buyer configuration
make test-marketplace # Test marketplace functionality

# Maintenance
make clean           # Clean build artifacts
make audit           # Security audit
make info            # Show project info
```

## 🌐 API Integration

The buyer frontend communicates with the backend API at:
- Development: `http://localhost:8000`
- Production: Configured via `REACT_APP_API_URL`

### API Endpoints Used

- `GET /api/v1/health` - System health check
- `GET /api/v1/products` - Browse products
- `GET /api/v1/products/{id}` - Get product details
- `GET /api/v1/sellers` - List sellers
- `GET /api/v1/sellers/{id}` - Get seller details
- `GET /api/v1/wood-types` - List wood types
- `GET /api/v1/buyers/{id}` - Get buyer profile
- `PATCH /api/v1/buyers/{id}` - Update buyer profile
- `POST /api/v1/buyers` - Create buyer account
- `GET /api/v1/chat-threads` - List buyer chats
- `POST /api/v1/chat-threads` - Create chat thread
- `GET /api/v1/chat-messages` - Get messages
- `POST /api/v1/chat-messages` - Send message

## 🛍️ E-commerce Features

### Product Discovery
- **Browse Products**: View all available wood products
- **Search & Filter**: Find products by criteria
- **Product Details**: Comprehensive product information
- **Price Comparison**: Compare prices per cubic meter
- **Seller Information**: View seller profiles and ratings

### AI Board Analyzer
- **Image Upload**: Upload wood board images
- **Volume Estimation**: AI-powered volume calculation
- **Confidence Scoring**: Analysis reliability metrics
- **Market Recommendations**: Pricing insights based on analysis
- **Quality Assessment**: Board condition evaluation

### Communication
- **Direct Messaging**: Chat with sellers about products
- **Inquiry Management**: Track all conversations
- **Real-time Updates**: Instant message notifications
- **Conversation History**: Complete communication records

## 🎨 UI/UX Features

- **Customer-Centric Design**: Intuitive shopping experience
- **Mobile-First**: Responsive design for all devices
- **Hero Section**: Engaging homepage with featured content
- **Product Cards**: Attractive product presentation
- **Search Interface**: Easy-to-use search and filtering
- **Loading States**: Smooth user experience
- **Error Handling**: Helpful error messages and recovery

## 🔧 Configuration

### Environment Variables

```bash
REACT_APP_API_URL=http://localhost:8000  # Backend API URL
NODE_ENV=development                      # Environment mode
```

### Mock Data Configuration

The application uses a mock buyer ID for development:
```javascript
const MOCK_BUYER_ID = '123e4567-e89b-12d3-a456-426614174001';
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

- Input validation and sanitization
- Secure file upload for board analysis
- XSS protection
- CORS compliance
- Secure Docker configuration
- Privacy protection for user data

## 🤖 AI Board Analyzer

### How It Works
1. **Image Upload**: Users upload wood board images
2. **AI Processing**: Computer vision algorithms analyze the image
3. **Volume Calculation**: Machine learning models estimate volume
4. **Quality Assessment**: Evaluate board condition and defects
5. **Market Insights**: Provide pricing recommendations

### Supported Features
- **Volume Estimation**: Accurate cubic meter calculations
- **Confidence Scoring**: Reliability metrics for estimates
- **Quality Analysis**: Surface defect detection
- **Market Pricing**: Value estimation based on current market

## 🐛 Troubleshooting

### Common Issues

1. **Product Loading Problems**
   - Check backend API connectivity
   - Verify product data availability
   - Confirm network connection

2. **Board Analyzer Issues**
   - Ensure image file is supported format
   - Check file size limitations
   - Verify AI service availability

3. **Search Not Working**
   - Check search query formatting
   - Verify backend search endpoints
   - Confirm product data indexing

### Health Checks

```bash
make health-check      # Check development server
make health-check-prod # Check production server
make test-api          # Test backend connectivity
make test-marketplace  # Test marketplace functionality
```

## 📊 Performance Optimization

- **Image Optimization**: Compressed product images
- **Lazy Loading**: On-demand component loading
- **Search Optimization**: Efficient query processing
- **Caching Strategy**: Smart data caching
- **Bundle Splitting**: Optimized code delivery

## 🛒 Shopping Workflow

1. **Browse Products**: Explore available wood products
2. **Use Board Analyzer**: Estimate wood volume with AI
3. **Compare Options**: Evaluate products and prices
4. **Contact Sellers**: Initiate conversations
5. **Negotiate Terms**: Discuss pricing and delivery
6. **Complete Purchase**: Finalize transaction details

## 📱 Mobile Experience

- **Touch-Friendly**: Optimized for mobile interaction
- **Fast Loading**: Quick page transitions
- **Offline Support**: Basic functionality without connection
- **App-Like Feel**: Native mobile experience
- **Responsive Images**: Optimized for different screen sizes

## 🤝 Contributing

1. Follow React and e-commerce best practices
2. Implement proper form validation
3. Add comprehensive error handling
4. Test all user workflows
5. Maintain clean, readable code
6. Focus on user experience

## 📈 Analytics & Insights

- **User Behavior**: Track browsing patterns
- **Search Analytics**: Monitor search queries
- **Conversion Tracking**: Measure engagement
- **Performance Metrics**: Monitor app performance

## 📝 License

Part of the Diplom project - Wood Products Marketplace.

## 🆘 Support

For customer and technical support:
1. Check the troubleshooting section
2. Review marketplace documentation
3. Test connectivity and functionality
4. Contact seller support for product inquiries
