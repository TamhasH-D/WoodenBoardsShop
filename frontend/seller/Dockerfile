# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Accept build arguments for API URLs
ARG REACT_APP_API_URL
ARG REACT_APP_WOODEN_BOARDS_API_URL

# Set environment variables for build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WOODEN_BOARDS_API_URL=$REACT_APP_WOODEN_BOARDS_API_URL

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install --production=false --silent

# Copy source code
COPY . .

# Build the application with environment variables
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
