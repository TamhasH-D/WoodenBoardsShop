# Wood Trading Marketplace API Documentation

## 🏗️ API Overview

The Wood Trading Marketplace backend is a comprehensive FastAPI-based microservices architecture designed to facilitate wood product trading between sellers and buyers. The system integrates advanced AI-powered image processing for automated board volume calculation using YOLO (You Only Look Once) computer vision technology.

### Architecture Components

- **Main Backend API** (Port 8000): Core business logic, user management, and data persistence
- **YOLO Backend Service** (Port 8001): AI-powered image processing for wooden board analysis
- **YOLO Detection Service** (Port 8002): Computer vision segmentation and volume calculation
- **PostgreSQL Database**: Primary data storage with full ACID compliance
- **Redis Cache**: Session management and performance optimization

### Key Features

- 🏪 **Multi-vendor Marketplace**: Sellers can list wood products, buyers can browse and purchase
- 🤖 **AI-Powered Analysis**: Automated board volume calculation from uploaded images
- 💬 **Real-time Communication**: Chat system between buyers and sellers
- 📊 **Dynamic Pricing**: Wood type pricing with historical tracking
- 🔐 **Role-based Access**: Admin, Seller, and Buyer user roles
- 📱 **Multi-platform Support**: RESTful API supporting web and mobile frontends

## 🔐 Authentication & Authorization

### Current Authentication System

The API currently uses a **development-friendly approach** without mandatory authentication for rapid prototyping and testing. In production, this would be replaced with a robust authentication system.

#### User Roles

1. **Admin** (Full System Access)
   - Manage all users, products, and system settings
   - Access to analytics and system health monitoring
   - CRUD operations on all entities

2. **Seller** (Business Dashboard Access)
   - Manage own products and inventory
   - Set wood types and pricing
   - Communicate with buyers
   - Access sales analytics

3. **Buyer** (Customer Marketplace Access)
   - Browse and search products
   - Communicate with sellers
   - Manage personal profile
   - Access purchase history

#### Authentication Flow (Development)

```bash
# No authentication required for development
# All endpoints are accessible without tokens
curl -X GET "http://localhost:8000/api/v1/products"
```

#### Future Authentication (Production)

```bash
# Planned JWT-based authentication
curl -X GET "http://localhost:8000/api/v1/products" \
  -H "Authorization: Bearer <jwt_token>"
```

## 📚 API Endpoints Overview

### Core Entities

| Entity | Endpoint | Description |
|--------|----------|-------------|
| **Health** | `/health` | System health monitoring |
| **Buyers** | `/buyers` | Customer management |
| **Sellers** | `/sellers` | Vendor management |
| **Products** | `/products` | Product catalog |
| **Wood Types** | `/wood-types` | Wood species management |
| **Wood Type Prices** | `/wood-type-prices` | Dynamic pricing system |
| **Images** | `/images` | Product image management |
| **Wooden Boards** | `/wooden-boards` | AI-powered board analysis |
| **Chat Threads** | `/chat-threads` | Communication channels |
| **Chat Messages** | `/chat-messages` | Real-time messaging |
| **YOLO Integration** | `/wooden_boards_volume_seg` | AI image processing |

### Base URL

```
Development: http://localhost:8000/api/v1
Production: https://your-domain.com/api/v1
```

## 📖 Detailed Endpoint Documentation

- [🏥 Health Check API](./health_api.md) - System monitoring and status
- [👥 Buyers API](./buyers_api.md) - Customer management
- [🏪 Sellers API](./seller_api.md) - Vendor management
- [📦 Products API](./product_api.md) - Product catalog management
- [🌳 Wood Types API](./wood_types_api.md) - Wood species management
- [💰 Wood Type Prices API](./wood_type_price_api.md) - Dynamic pricing system
- [🖼️ Images API](./image_api.md) - Product image management
- [📏 Wooden Boards API](./wooden_board_api.md) - AI-powered board analysis
- [💬 Chat Threads API](./chat_threads_api.md) - Communication channels
- [📨 Chat Messages API](./chat_messages_api.md) - Real-time messaging
- [🎯 Demo API](./demo_api.md) - Development and testing utilities

## 🗄️ Database Schema & Entity Relationships

### Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Buyer     │    │   Seller    │    │    Admin    │
│             │    │             │    │             │
│ - id        │    │ - id        │    │ - id        │
│ - keycloak  │    │ - keycloak  │    │ - keycloak  │
│ - is_online │    │ - is_online │    │ - is_online │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────────────────────────────────────────────┐
│                ChatThread                           │
│ - id, buyer_id, seller_id                          │
│ - created_at, updated_at                           │
└─────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│                ChatMessage                          │
│ - id, message, thread_id                           │
│ - buyer_id, seller_id                              │
│ - is_read_by_buyer, is_read_by_seller              │
└─────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  WoodType   │    │   Product   │    │    Image    │
│             │    │             │    │             │
│ - id        │◄───┤ - id        ├───►│ - id        │
│ - name      │    │ - title     │    │ - image_path│
│ - desc      │    │ - volume    │    │ - product_id│
└─────────────┘    │ - price     │    └─────────────┘
       │           │ - seller_id │
       ▼           │ - wood_type │
┌─────────────┐    └─────────────┘
│WoodTypePrice│           │
│             │           ▼
│ - id        │    ┌─────────────┐
│ - price     │    │WoodenBoard  │
│ - wood_type │    │             │
│ - date      │    │ - id        │
└─────────────┘    │ - length    │
                   │ - width     │
                   │ - height    │
                   │ - volume    │
                   └─────────────┘
```

### Core Relationships

1. **Users → Products**: Sellers create and manage products
2. **Products → Wood Types**: Each product has a specific wood type
3. **Wood Types → Prices**: Historical pricing with date tracking
4. **Products → Images**: Multiple images per product
5. **Users → Chat**: Buyers and sellers communicate through threads
6. **Products → Wooden Boards**: AI-analyzed board specifications

### Database Models

#### User Entities

**Buyer Model**
```python
class Buyer:
    id: UUID (Primary Key, Auto-generated)
    keycloak_uuid: UUID (Unique, External Auth ID)
    is_online: bool (Default: False)
    created_at: datetime
    updated_at: datetime

    # Relationships
    chat_messages: List[ChatMessage]
    chat_threads: List[ChatThread]
```

**Seller Model**
```python
class Seller:
    id: UUID (Primary Key, Auto-generated)
    keycloak_uuid: UUID (Unique, External Auth ID)
    is_online: bool (Default: False)
    created_at: datetime
    updated_at: datetime

    # Relationships
    products: List[Product]
    chat_messages: List[ChatMessage]
    chat_threads: List[ChatThread]
```

#### Product Entities

**Product Model**
```python
class Product:
    id: UUID (Primary Key, Auto-generated)
    title: str (Required)
    volume: float (Required)
    price: float (Required)
    descrioption: str (Optional, Note: typo in original)
    delivery_possible: bool (Default: False)
    pickup_location: str (Optional)
    created_at: datetime
    updated_at: datetime
    seller_id: UUID (Foreign Key → Seller)
    wood_type_id: UUID (Foreign Key → WoodType)

    # Relationships
    seller: Seller
    wood_type: WoodType
    images: List[Image]
```

**WoodType Model**
```python
class WoodType:
    id: UUID (Primary Key, Auto-generated)
    name: str (Required, Unique)
    description: str (Optional)
    created_at: datetime
    updated_at: datetime

    # Relationships
    products: List[Product]
    prices: List[WoodTypePrice]
```

**WoodTypePrice Model**
```python
class WoodTypePrice:
    id: UUID (Primary Key, Auto-generated)
    price_per_cubic_meter: float (Required)
    effective_date: datetime (Required)
    created_at: datetime
    wood_type_id: UUID (Foreign Key → WoodType)

    # Relationships
    wood_type: WoodType
```

#### Communication Entities

**ChatThread Model**
```python
class ChatThread:
    id: UUID (Primary Key, Auto-generated)
    created_at: datetime
    updated_at: datetime
    buyer_id: UUID (Foreign Key → Buyer)
    seller_id: UUID (Foreign Key → Seller)

    # Relationships
    buyer: Buyer
    seller: Seller
    messages: List[ChatMessage]
```

**ChatMessage Model**
```python
class ChatMessage:
    id: UUID (Primary Key, Auto-generated)
    message: str (Required)
    is_read_by_buyer: bool (Default: False)
    is_read_by_seller: bool (Default: False)
    created_at: datetime
    thread_id: UUID (Foreign Key → ChatThread)
    buyer_id: UUID (Foreign Key → Buyer)
    seller_id: UUID (Foreign Key → Seller)

    # Relationships
    thread: ChatThread
    buyer: Buyer
    seller: Seller
```

#### Media & Analysis Entities

**Image Model**
```python
class Image:
    id: UUID (Primary Key, Auto-generated)
    image_path: str (Required)
    product_id: UUID (Foreign Key → Product)

    # Relationships
    product: Product
```

**WoodenBoard Model**
```python
class WoodenBoard:
    id: UUID (Primary Key, Auto-generated)
    length: float (Required, cm)
    width: float (Required, cm)
    height: float (Required, cm)
    volume: float (Calculated, cubic meters)
    created_at: datetime
    updated_at: datetime
```

## 🔧 Integration Guides

### Frontend Integration

#### React/JavaScript Example

```javascript
// API Client Setup
const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiClient {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async postFormData(endpoint, formData) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
}

// Usage Examples
const api = new ApiClient();

// Get all products with pagination
const products = await api.get('/products?page=1&per_page=20');

// Create a new product
const newProduct = await api.post('/products', {
  title: "Premium Oak Planks",
  volume: 2.5,
  price: 150.00,
  descrioption: "High-quality oak planks for furniture making",
  delivery_possible: true,
  pickup_location: "Warehouse District",
  wood_type_id: "3ab0f210-ca78-4312-841b-8b1ae774adac",
  seller_id: "987fcdeb-51a2-43d1-9f12-345678901234"
});

// Get wood types for dropdown
const woodTypes = await api.get('/wood-types');

// Create a buyer account
const buyer = await api.post('/buyers', {
  keycloak_uuid: "456e7890-e12b-34c5-d678-901234567890"
});
```

#### Error Handling

```javascript
// Robust error handling
async function createProductWithErrorHandling(productData) {
  try {
    const result = await api.post('/products', productData);
    console.log('Product created:', result.data);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to create product:', error);

    if (error.message.includes('422')) {
      return { success: false, error: 'Validation failed' };
    } else if (error.message.includes('404')) {
      return { success: false, error: 'Seller or wood type not found' };
    } else {
      return { success: false, error: 'Server error' };
    }
  }
}
```

### YOLO Image Processing Integration

#### Upload Image for Volume Analysis

```javascript
// Frontend: Upload image for AI analysis
async function analyzeBoard(imageFile, height, length) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('height', height.toString());
  formData.append('length', length.toString());

  try {
    const response = await fetch('/api/v1/wooden_boards_volume_seg/', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      volume: result.volume,
      width: result.width,
      segmented_image: result.segmented_image_base64
    };
  } catch (error) {
    console.error('Board analysis failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Usage Example
const fileInput = document.getElementById('board-image');
const heightInput = document.getElementById('board-height');
const lengthInput = document.getElementById('board-length');

const result = await analyzeBoard(
  fileInput.files[0],
  parseFloat(heightInput.value),
  parseFloat(lengthInput.value)
);

if (result.success) {
  console.log('Calculated volume:', result.volume, 'cubic meters');
  console.log('Calculated width:', result.width, 'cm');
  // Display segmented image
  document.getElementById('result-image').src =
    `data:image/jpeg;base64,${result.segmented_image}`;
} else {
  console.error('Analysis failed:', result.error);
}
```

#### Service Communication Flow

```
Frontend → Main Backend → YOLO Backend → YOLO Detect → Response Chain
```

**Detailed Flow:**

1. **Frontend** uploads image with dimensions to `/api/v1/wooden_boards_volume_seg/`
2. **Main Backend** receives request and forwards to YOLO backend service
3. **YOLO Backend** (`http://yolo_backend:8001`) processes the request
4. **YOLO Detect** (`http://detect:8002`) performs computer vision analysis
5. **Response** flows back through the chain with calculated volume and segmented image

#### YOLO Service Endpoints

**Main Backend Proxy Endpoint:**
```
POST /api/v1/wooden_boards_volume_seg/
```

**Direct YOLO Backend Endpoint:**
```
POST http://localhost:8001/wooden_boards_volume_seg/
```

**YOLO Detection Service:**
```
POST http://localhost:8002/detect_seg/
```

#### File Upload Specifications

- **Supported Formats**: JPEG, PNG, WebP
- **Maximum File Size**: 10MB
- **Recommended Resolution**: 1024x1024 pixels or higher
- **Required Parameters**:
  - `image`: Image file (multipart/form-data)
  - `height`: Board height in centimeters (float)
  - `length`: Board length in centimeters (float)

#### Response Format

```json
{
  "volume": 0.125,
  "width": 25.0,
  "segmented_image_base64": "iVBORw0KGgoAAAANSUhEUgAA...",
  "processing_time": 2.34,
  "confidence": 0.95
}
```

## 🚀 Development Workflow

### Local Development Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd diplom

# 2. Setup environment (cross-platform)
./scripts/setup.sh

# 3. Start all services
make up

# 4. Verify services are running
make ps

# 5. Access API documentation
open http://localhost:8000/docs

# 6. Check service health
curl http://localhost:8000/api/v1/health
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_DEBUG=true
BACKEND_LOG_LEVEL=info

# Database Configuration
BACKEND_PG_HOST=backend-pg
BACKEND_PG_PORT=5432
BACKEND_PG_USER=backend
BACKEND_PG_PASSWORD=backend
BACKEND_PG_DATABASE=backend

# Redis Configuration
BACKEND_REDIS_HOST=backend-redis
BACKEND_REDIS_PORT=6379

# CORS Configuration
BACKEND_CORS_ALLOW_ORIGINS=*

# YOLO Service URLs
BACKEND_PROSTO_BOARD_VOLUME_SEG_URL=http://yolo_backend:8001/wooden_boards_volume_seg/
YOLO_SERVICE_SEGMENT_URL=http://detect:8002/detect_seg/
```

### Database Migrations

```bash
# Create new migration
cd backend/backend
alembic revision --autogenerate -m "Add new feature"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Check migration status
alembic current

# View migration history
alembic history
```

### Using Make Commands

```bash
# Start all services
make up

# Stop all services
make down

# Rebuild all services
make rebuild

# View logs
make logs

# Backend-specific commands
make backend-up        # Start only backend services
make backend-down      # Stop backend services
make backend-logs      # View backend logs
make backend-migrate   # Run database migrations

# Development
make dev              # Quick start for backend development

# Cleanup
make clean            # Clean Docker resources
make clean-all        # Clean all Docker resources including networks
```

### Testing Endpoints

#### Using cURL

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Get all products
curl http://localhost:8000/api/v1/products

# Get products with pagination
curl "http://localhost:8000/api/v1/products?page=1&per_page=10"

# Get specific product
curl http://localhost:8000/api/v1/products/{product_id}

# Create a new buyer
curl -X POST http://localhost:8000/api/v1/buyers \
  -H "Content-Type: application/json" \
  -d '{
    "keycloak_uuid": "3ab0f210-ca78-4312-841b-8b1ae774adac",
    "is_online": false
  }'

# Create a new seller
curl -X POST http://localhost:8000/api/v1/sellers \
  -H "Content-Type: application/json" \
  -d '{
    "keycloak_uuid": "987fcdeb-51a2-43d1-9f12-345678901234",
    "is_online": true
  }'

# Create a wood type
curl -X POST http://localhost:8000/api/v1/wood-types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Oak",
    "description": "High-quality oak wood"
  }'

# Create a product
curl -X POST http://localhost:8000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Oak Planks",
    "volume": 2.5,
    "price": 150.00,
    "descrioption": "High-quality oak planks",
    "delivery_possible": true,
    "pickup_location": "Warehouse District",
    "seller_id": "987fcdeb-51a2-43d1-9f12-345678901234",
    "wood_type_id": "456e7890-e12b-34c5-d678-901234567890"
  }'

# Upload image for analysis
curl -X POST http://localhost:8000/api/v1/wooden_boards_volume_seg/ \
  -F "image=@board_image.jpg" \
  -F "height=5.0" \
  -F "length=100.0"

# Create chat thread
curl -X POST http://localhost:8000/api/v1/chat-threads \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_id": "3ab0f210-ca78-4312-841b-8b1ae774adac",
    "seller_id": "987fcdeb-51a2-43d1-9f12-345678901234"
  }'

# Send chat message
curl -X POST http://localhost:8000/api/v1/chat-messages \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, I am interested in your oak planks",
    "thread_id": "thread-uuid-here",
    "buyer_id": "3ab0f210-ca78-4312-841b-8b1ae774adac",
    "seller_id": "987fcdeb-51a2-43d1-9f12-345678901234"
  }'
```

#### Using Postman

Import the following collection for comprehensive API testing:

```json
{
  "info": {
    "name": "Wood Trading Marketplace API",
    "description": "Complete API collection for testing all endpoints",
    "version": "1.0.0"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8000/api/v1",
      "type": "string"
    },
    {
      "key": "buyerId",
      "value": "3ab0f210-ca78-4312-841b-8b1ae774adac",
      "type": "string"
    },
    {
      "key": "sellerId",
      "value": "987fcdeb-51a2-43d1-9f12-345678901234",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "Create Buyer",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/buyers",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"keycloak_uuid\": \"{{buyerId}}\",\n  \"is_online\": false\n}"
        }
      }
    },
    {
      "name": "Create Product",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/products",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Premium Oak Planks\",\n  \"volume\": 2.5,\n  \"price\": 150.00,\n  \"descrioption\": \"High-quality oak planks\",\n  \"delivery_possible\": true,\n  \"pickup_location\": \"Warehouse District\",\n  \"seller_id\": \"{{sellerId}}\",\n  \"wood_type_id\": \"wood-type-uuid-here\"\n}"
        }
      }
    },
    {
      "name": "Analyze Board Image",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/wooden_boards_volume_seg/",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "image",
              "type": "file",
              "src": "board_image.jpg"
            },
            {
              "key": "height",
              "value": "5.0",
              "type": "text"
            },
            {
              "key": "length",
              "value": "100.0",
              "type": "text"
            }
          ]
        }
      }
    }
  ]
}
```

## 🐳 Deployment Information

### Environment Configuration

The API uses environment variables for configuration. Key variables:

```bash
# Backend Configuration
BACKEND_HOST=0.0.0.0              # Bind to all interfaces
BACKEND_PORT=8000                 # Main API port
BACKEND_DEBUG=false               # Disable debug in production
BACKEND_LOG_LEVEL=warning         # Production log level
BACKEND_WORKERS=4                 # Number of worker processes

# Database Configuration
BACKEND_PG_HOST=backend-pg        # PostgreSQL host (Docker service name)
BACKEND_PG_PORT=5432              # PostgreSQL port
BACKEND_PG_USER=backend           # Database user
BACKEND_PG_PASSWORD=backend       # Database password
BACKEND_PG_DATABASE=backend       # Database name

# Redis Configuration
BACKEND_REDIS_HOST=backend-redis  # Redis host (Docker service name)
BACKEND_REDIS_PORT=6379           # Redis port
BACKEND_REDIS_PASSWORD=           # Redis password (empty for development)

# CORS Configuration
BACKEND_CORS_ALLOW_ORIGINS=*      # Allowed origins (* for development)
BACKEND_CORS_ALLOW_CREDENTIALS=true
BACKEND_CORS_ALLOW_METHODS=*
BACKEND_CORS_ALLOW_HEADERS=*

# Service Communication
BACKEND_PROSTO_BOARD_VOLUME_SEG_URL=http://yolo_backend:8001/wooden_boards_volume_seg/
YOLO_SERVICE_SEGMENT_URL=http://detect:8002/detect_seg/
```

### Docker Setup

The system uses Docker Compose for orchestration:

```yaml
# docker-compose.yaml structure
services:
  api:                    # Main FastAPI backend (Port 8000)
    image: backend-api
    depends_on: [postgres, redis]
    networks: [diplom_default, backend-network]

  postgres:               # PostgreSQL database (Port 5432)
    image: postgres:15
    networks: [backend-network]

  redis:                  # Redis cache (Port 6379)
    image: redis:7-alpine
    networks: [backend-network]

  yolo_backend:           # AI processing service (Port 8001)
    image: yolo-backend
    depends_on: [detect]
    networks: [diplom_default, app_network]

  detect:                 # Computer vision service (Port 8002)
    image: yolo-detect
    networks: [app_network]

  admin:                  # Admin frontend (Port 8080)
    image: admin-frontend
    networks: [diplom_default]

  seller:                 # Seller frontend (Port 8081)
    image: seller-frontend
    networks: [diplom_default]

  buyer:                  # Buyer frontend (Port 8082)
    image: buyer-frontend
    networks: [diplom_default]
```

### Service Communication

```bash
# Internal Docker network communication
Main Backend → YOLO Backend: http://yolo_backend:8001
YOLO Backend → Detect: http://detect:8002
Frontend → Backend: http://localhost:8000 (host access)

# Database connections
Main Backend → PostgreSQL: backend-pg:5432
Main Backend → Redis: backend-redis:6379
```

### Health Monitoring

```bash
# Check all service health
curl http://localhost:8000/api/v1/health

# Individual service status
docker ps                    # Container status
make ps                      # Service status via Make
docker logs backend-api      # Backend logs
docker logs yolo_backend     # YOLO service logs
```

### Production Deployment

```bash
# Production environment setup
export NODE_ENV=production
export BACKEND_DEBUG=false
export BACKEND_LOG_LEVEL=warning

# Build production images
make build

# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d

# Monitor deployment
docker-compose logs -f
```

## 📊 API Response Formats

### Standard Response Structure

All API responses follow a consistent format:

#### Success Response (Single Entity)

```json
{
  "data": {
    "id": "3ab0f210-ca78-4312-841b-8b1ae774adac",
    "title": "Premium Oak Planks",
    "volume": 2.5,
    "price": 150.00,
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

#### Success Response (Collection)

```json
{
  "data": [
    {
      "id": "3ab0f210-ca78-4312-841b-8b1ae774adac",
      "title": "Premium Oak Planks",
      "volume": 2.5,
      "price": 150.00
    },
    {
      "id": "987fcdeb-51a2-43d1-9f12-345678901234",
      "title": "Pine Boards",
      "volume": 1.8,
      "price": 85.00
    }
  ],
  "total": 25,
  "page": 1,
  "per_page": 20,
  "pages": 2
}
```

#### Empty Response

```json
{
  "message": "Operation completed successfully"
}
```

### Error Response Format

#### Validation Error (422)

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "title"],
      "msg": "Field required",
      "input": {}
    },
    {
      "type": "value_error",
      "loc": ["body", "price"],
      "msg": "Price must be greater than 0",
      "input": -10.0
    }
  ]
}
```

#### Not Found Error (404)

```json
{
  "detail": "Product not found"
}
```

#### Server Error (500)

```json
{
  "detail": "Internal server error",
  "error_id": "err_123456789",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Pagination Response

```json
{
  "data": [/* Array of items */],
  "total": 100,           // Total number of items
  "page": 1,              // Current page (1-based)
  "per_page": 20,         // Items per page
  "pages": 5,             // Total number of pages
  "has_next": true,       // Has next page
  "has_prev": false,      // Has previous page
  "next_page": 2,         // Next page number
  "prev_page": null       // Previous page number
}
```

### YOLO Analysis Response

```json
{
  "volume": 0.125,                              // Calculated volume in cubic meters
  "width": 25.0,                               // Calculated width in centimeters
  "segmented_image_base64": "iVBORw0KGgo...",  // Base64 encoded segmented image
  "processing_time": 2.34,                     // Processing time in seconds
  "confidence": 0.95,                          // AI confidence score (0-1)
  "metadata": {
    "image_dimensions": [1024, 768],
    "detected_objects": 1,
    "algorithm_version": "YOLOv8"
  }
}
```

## 🔍 Common HTTP Status Codes

| Code | Meaning | Usage | Example |
|------|---------|-------|---------|
| **200** | OK | Successful GET, PUT, PATCH | `GET /products` |
| **201** | Created | Successful POST | `POST /products` |
| **204** | No Content | Successful DELETE | `DELETE /products/{id}` |
| **400** | Bad Request | Invalid request format | Malformed JSON |
| **404** | Not Found | Resource doesn't exist | `GET /products/invalid-id` |
| **422** | Unprocessable Entity | Validation errors | Missing required fields |
| **500** | Internal Server Error | Server-side errors | Database connection failed |

### Error Handling Best Practices

```javascript
// Frontend error handling example
async function handleApiCall(apiFunction) {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    const status = error.status || 500;

    switch (status) {
      case 400:
        return { success: false, error: 'Invalid request format' };
      case 404:
        return { success: false, error: 'Resource not found' };
      case 422:
        return { success: false, error: 'Validation failed', details: error.detail };
      case 500:
        return { success: false, error: 'Server error, please try again' };
      default:
        return { success: false, error: 'Unexpected error occurred' };
    }
  }
}
```

---

## 📞 Support & Contributing

### API Documentation Maintenance

- **Documentation Location**: `backend/backend/backend/docs/`
- **Auto-generated Docs**: Available at `http://localhost:8000/docs` (Swagger UI)
- **ReDoc Format**: Available at `http://localhost:8000/redoc`

### Contributing Guidelines

1. **API Changes**: Update both code and documentation
2. **New Endpoints**: Add comprehensive documentation with examples
3. **Breaking Changes**: Update version and migration guide
4. **Testing**: Include cURL examples and Postman collections

### Getting Help

- **API Issues**: Check logs with `make backend-logs`
- **Service Issues**: Verify with `make ps` and `curl http://localhost:8000/api/v1/health`
- **Database Issues**: Check migrations with `make backend-migrate-status`
- **YOLO Issues**: Test direct endpoints at ports 8001 and 8002

---

**Last Updated**: December 2024
**API Version**: v1
**Documentation Version**: 2.0
**Maintainer**: Diplom Project Team
```
```