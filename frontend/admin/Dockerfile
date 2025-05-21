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