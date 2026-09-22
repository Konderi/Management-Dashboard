# Multi-stage Dockerfile for Nexus Infrastructure Management Platform
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci

# Copy source code
COPY . .

# Build frontend and compile backend
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm ci --omit=dev


# Copy compiled files from builder
COPY --from=builder /app/dist ./dist

# Create data directory for persisted config
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "dist/server/index.js"]
