# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Accept build arguments for environment variables
ARG REACT_APP_API_URL
ARG REACT_APP_API_TIMEOUT
ARG REACT_APP_ENABLE_ANALYTICS
ARG REACT_APP_ENABLE_DEBUG_TOOLS

# Set environment variables for build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_API_TIMEOUT=$REACT_APP_API_TIMEOUT
ENV REACT_APP_ENABLE_ANALYTICS=$REACT_APP_ENABLE_ANALYTICS
ENV REACT_APP_ENABLE_DEBUG_TOOLS=$REACT_APP_ENABLE_DEBUG_TOOLS

# Build the React app
RUN npm run build

# Nginx stage
FROM nginx:stable-alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Nginx runs as non-root by default in stable-alpine
CMD ["nginx", "-g", "daemon off;"]