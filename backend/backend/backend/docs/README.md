# Wood Trading Marketplace API Documentation

## 📚 Documentation Overview

This directory contains comprehensive API documentation for the Wood Trading Marketplace backend system. The documentation is designed to serve as both a developer reference and onboarding guide for new team members.

## 📁 Documentation Structure

### Main Documentation
- **[api_documentation.md](./api_documentation.md)** - Complete API reference guide
  - System architecture overview
  - Authentication and authorization
  - Database schema and relationships
  - Integration guides and examples
  - Development workflow
  - Deployment information

### Endpoint-Specific Documentation
- **[health_api.md](./health_api.md)** - System health monitoring endpoints
- **[buyers_api.md](./buyers_api.md)** - Customer management endpoints
- **[seller_api.md](./seller_api.md)** - Vendor management endpoints
- **[product_api.md](./product_api.md)** - Product catalog endpoints
- **[wood_types_api.md](./wood_types_api.md)** - Wood species management
- **[wood_type_price_api.md](./wood_type_price_api.md)** - Dynamic pricing system
- **[image_api.md](./image_api.md)** - Product image management
- **[wooden_board_api.md](./wooden_board_api.md)** - AI-powered board analysis
- **[chat_threads_api.md](./chat_threads_api.md)** - Communication channels
- **[chat_messages_api.md](./chat_messages_api.md)** - Real-time messaging
- **[demo_api.md](./demo_api.md)** - Development and testing utilities

## 🚀 Quick Start

### For Developers
1. **Read the main documentation**: Start with [api_documentation.md](./api_documentation.md)
2. **Set up local environment**: Follow the development workflow section
3. **Test endpoints**: Use the provided cURL examples or Postman collection
4. **Explore specific APIs**: Refer to endpoint-specific documentation

### For Frontend Developers
1. **Review integration guides**: See the frontend integration section
2. **Understand authentication**: Check the authentication flow
3. **Study response formats**: Learn the standard response structure
4. **Test YOLO integration**: Follow the image processing examples

### For DevOps/Deployment
1. **Review deployment section**: Understand Docker setup and configuration
2. **Check environment variables**: Configure production settings
3. **Monitor health endpoints**: Set up health monitoring
4. **Review service communication**: Understand microservice architecture

## 🔧 API Access

### Development Environment
- **Base URL**: `http://localhost:8000/api/v1`
- **Interactive Docs**: `http://localhost:8000/docs` (Swagger UI)
- **ReDoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/api/v1/health`

### Service Ports
- **Main Backend**: 8000
- **YOLO Backend**: 8001
- **YOLO Detect**: 8002
- **Admin Frontend**: 8080
- **Seller Frontend**: 8081
- **Buyer Frontend**: 8082

## 📊 Key Features Documented

### Core Functionality
- ✅ **User Management** - Buyers, Sellers, Admin roles
- ✅ **Product Catalog** - CRUD operations with search and filtering
- ✅ **Wood Type Management** - Species and dynamic pricing
- ✅ **AI Image Processing** - YOLO-powered board volume calculation
- ✅ **Real-time Chat** - Communication between buyers and sellers
- ✅ **File Upload** - Image handling and processing

### Technical Features
- ✅ **RESTful API Design** - Standard HTTP methods and status codes
- ✅ **Microservice Architecture** - Main backend + YOLO services
- ✅ **Database Integration** - PostgreSQL with SQLAlchemy ORM
- ✅ **Caching Layer** - Redis for performance optimization
- ✅ **Cross-platform Deployment** - Docker containerization
- ✅ **Health Monitoring** - Service status and diagnostics

## 🧪 Testing Resources

### cURL Examples
Each endpoint documentation includes comprehensive cURL examples for:
- Creating entities (POST requests)
- Retrieving data (GET requests)
- Updating records (PUT/PATCH requests)
- Deleting resources (DELETE requests)
- File uploads (multipart/form-data)

### Postman Collection
A complete Postman collection is provided in the main documentation with:
- Pre-configured environment variables
- Request examples for all endpoints
- Test scripts for validation
- Error handling examples

### Sample Data
Example JSON payloads are provided for:
- User creation (buyers, sellers)
- Product management
- Wood type and pricing setup
- Chat system usage
- Image upload and analysis

## 🔄 Documentation Maintenance

### Updating Documentation
1. **API Changes**: Update both code and documentation simultaneously
2. **New Endpoints**: Add comprehensive documentation with examples
3. **Breaking Changes**: Update version information and migration guides
4. **Response Format Changes**: Update all relevant examples

### Documentation Standards
- **Consistent Format**: Follow the established markdown structure
- **Complete Examples**: Include request/response examples for all endpoints
- **Error Scenarios**: Document common error cases and solutions
- **Code Samples**: Provide working code examples in multiple languages

### Version Control
- **Documentation Version**: Tracked alongside API version
- **Change Log**: Major changes documented in git commits
- **Backward Compatibility**: Maintain documentation for supported API versions

## 📞 Support

### Getting Help
- **API Issues**: Check the troubleshooting section in main documentation
- **Integration Questions**: Review the integration guides and examples
- **Deployment Problems**: Consult the deployment information section
- **Performance Issues**: Check the health monitoring endpoints

### Contributing
- **Documentation Improvements**: Submit pull requests with clear descriptions
- **New Examples**: Add practical use cases and code samples
- **Error Corrections**: Report and fix any inaccuracies
- **Translation**: Help translate documentation to other languages

## 🎯 Next Steps

### For New Developers
1. Set up the development environment using the quick start guide
2. Test the health endpoint to verify system connectivity
3. Create test entities using the provided examples
4. Explore the YOLO image processing functionality
5. Build a simple frontend integration

### For System Administrators
1. Review the deployment configuration requirements
2. Set up monitoring for all health endpoints
3. Configure production environment variables
4. Test the complete service communication chain
5. Implement backup and recovery procedures

---

**Documentation Last Updated**: December 2024  
**API Version**: v1  
**Supported Environments**: Development, Staging, Production  
**Maintainer**: Diplom Project Team
