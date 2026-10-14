# ====================================================================
# Multi-stage Dockerfile for ApexCrypto Pro Unified Platform
# Compatible with Railway, Render, Fly.io, and Local Docker
# ====================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests for workspace resolution
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install all dependencies (including dev tools)
RUN npm install

# Copy application source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build both backend (dist) and frontend (dist)
RUN npm run build

# ====================================================================
# Production Runner Container
# ====================================================================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

# Copy package manifests
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Copy hoisted node_modules directly from builder (fast & offline safe)
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled backend and frontend distribution bundles
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 4000

CMD ["node", "backend/dist/server.js"]
