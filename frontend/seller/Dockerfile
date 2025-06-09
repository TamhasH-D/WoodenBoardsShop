# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Accept build arguments
ARG REACT_APP_API_URL=http://localhost:8000
ARG REACT_APP_WOODEN_BOARDS_API_URL=http://localhost:8001
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WOODEN_BOARDS_API_URL=$REACT_APP_WOODEN_BOARDS_API_URL

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

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
