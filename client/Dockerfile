############################
# Build stage
############################
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm apk add --no-cache libc6-compat \
  && npm ci --no-audit --no-fund \
  || npm install --no-audit --no-fund --legacy-peer-deps

COPY . .
RUN npm run build

############################
# Runtime stage (Node.js server)
############################
FROM node:20-alpine

WORKDIR /app

# Install serve package for static file serving
RUN npm install -g serve

# Copy built files
COPY --from=build /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Start the static file server
CMD ["serve", "-s", "dist", "-l", "3000"]
