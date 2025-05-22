<<<<<<< HEAD
# Используем официальный образ Node.js LTS (Long Term Support) как базовый
FROM node:lts-alpine as build

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json (или yarn.lock)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Собираем приложение для production
RUN npm run build

# Используем легковесный образ Nginx для сервировки статических файлов
FROM nginx:alpine

# Копируем собранные статические файлы из стадии build в директорию Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Копируем конфигурацию Nginx (если есть кастомная)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80 для доступа к приложению
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
=======
# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# If you need to build the app (uncomment and modify as needed for your build process)
# RUN npm run build

# Nginx stage
FROM nginx:stable-alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage to nginx
COPY --from=build /app /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Nginx runs as non-root by default in stable-alpine
CMD ["nginx", "-g", "daemon off;"]
>>>>>>> ce59488e7852f9d2693d44ef147f24d4b922250d
