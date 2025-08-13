############################
# Build stage
############################
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Prefer reproducible install; gracefully fall back if peer deps or lock mismatches occur
RUN npm ci --silent --no-audit --no-fund || npm install --silent --no-audit --no-fund --legacy-peer-deps

COPY . .
RUN npm run build

############################
# Runtime stage (Nginx static server)
############################
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Use custom Nginx config for SPA routing and caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx listens on 80 by default
EXPOSE 80

# Use default nginx startup
