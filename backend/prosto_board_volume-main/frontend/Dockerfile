# Build stage
FROM node:20-slim AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование файлов пакетов
COPY app/package*.json .

# Установка зависимостей
RUN npm ci

# Копирование исходных файлов
COPY app .

# Сборка приложения
RUN npm run build --production

# Production stage
FROM nginx:alpine

# Копирование конфигурации Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копирование собранных активов из build-стадии
COPY --from=builder /app/dist /usr/share/nginx/html

# Установка команды запуска
CMD ["nginx", "-g", "daemon off;"]
