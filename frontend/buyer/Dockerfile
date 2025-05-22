# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

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
