# Seller Frontend - Улучшенная панель управления

Современная панель управления для продавцов древесины в проекте WoodenBoardsShop.

## ✨ Новые улучшения

### 🎨 Современный дизайн
- **Tailwind CSS** - современная система дизайна
- **Боковая панель навигации** - удобная навигация с иконками
- **Анимации** - плавные переходы и интерактивные элементы
- **Адаптивный дизайн** - работает на всех устройствах

### 📊 Улучшенная панель управления
- **Статистика бизнеса** - ключевые показатели в реальном времени
- **Быстрые действия** - быстрый доступ к основным функциям
- **Недавняя активность** - последние добавленные товары
- **График продаж** - визуализация данных с анимациями

### 🚀 Новые компоненты
- `BusinessStats` - карточки со статистикой
- `QuickActions` - быстрые действия с описаниями
- `RecentActivity` - недавние товары и активность
- `SalesChart` - интерактивные графики продаж
- `Sidebar` - современная боковая панель

## 🎯 Основные возможности

- **Панель управления**: Статистика продаж, показатели товаров, обзор производительности
- **Управление товарами**: Добавление, редактирование и управление инвентарем
- **Общение с клиентами**: Чаты с потенциальными покупателями в реальном времени
- **Анализатор досок**: AI-анализ изображений для расчета объема
- **Управление типами древесины**: Настройка цен и типов древесины
- **Аналитика**: Бизнес-аналитика и отслеживание продаж

## 🛠️ Технологический стек

- **React 18**: Современный React с хуками и функциональными компонентами
- **Tailwind CSS**: Utility-first CSS фреймворк для быстрой разработки
- **React Magic Motion**: Библиотека анимаций для плавных переходов
- **Lucide React**: Современные SVG иконки
- **Recharts**: Библиотека для создания интерактивных графиков
- **React Router 6**: Клиентская маршрутизация и навигация
- **Axios**: HTTP клиент для API коммуникации
- **Docker**: Контейнеризованное развертывание
- **Nginx**: Продакшн веб-сервер

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

## 📁 Структура проекта

```
src/
├── components/
│   ├── layout/          # Компоненты макета
│   │   └── Sidebar.js   # Боковая панель навигации
│   ├── dashboard/       # Компоненты панели управления
│   │   ├── BusinessStats.js    # Статистика бизнеса
│   │   ├── QuickActions.js     # Быстрые действия
│   │   ├── RecentActivity.js   # Недавняя активность
│   │   └── SalesChart.js       # График продаж
│   ├── ui/              # UI компоненты
│   │   ├── ErrorToast.js       # Уведомления об ошибках
│   │   ├── ImageUpload.js      # Загрузка изображений
│   │   └── ...
│   ├── Dashboard.js     # Главная панель управления
│   ├── Products.js      # Управление товарами
│   ├── Chats.js         # Общение с клиентами
│   ├── WoodTypesManager.js     # Управление типами древесины
│   └── BoardAnalyzerNew.js     # Анализатор досок
├── services/
│   └── api.js          # API сервисный слой
├── hooks/
│   └── useApi.js       # Пользовательские React хуки
├── utils/
│   ├── localization.js # Русская локализация
│   ├── constants.js    # Константы приложения
│   └── uuid.js         # Утилиты для UUID
├── App.js              # Главный компонент приложения
├── index.js            # Точка входа приложения
└── index.css           # Глобальные стили с Tailwind
```

## 🎨 Новые компоненты

### Sidebar (Боковая панель)
- Современная навигация с иконками
- Активные состояния для текущей страницы
- Информация о пользователе внизу
- Адаптивный дизайн

### BusinessStats (Статистика бизнеса)
- Карточки с ключевыми показателями
- Анимации загрузки
- Реальные данные из API
- Цветовая индикация трендов

### QuickActions (Быстрые действия)
- Интерактивные карточки действий
- Hover эффекты и анимации
- Описания для каждого действия
- Цветовая категоризация

### RecentActivity (Недавняя активность)
- Список последних товаров
- Быстрые действия для каждого элемента
- Состояния загрузки и пустых данных
- Ссылки на детальные страницы

### SalesChart (График продаж)
- Интерактивные графики с Recharts
- Демонстрационные данные продаж
- Статистические карточки
- Адаптивный дизайн графиков

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

### Authentication Configuration

The application requires real authentication system integration.
All mock IDs have been removed - implement proper Keycloak authentication.

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
