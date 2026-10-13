# ====================================================================
# Multi-stage Dockerfile for ApexCrypto Pro Unified Platform
# Compatible with Render Docker Web Services, Railway, Fly.io, and Local
# ====================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install all dependencies (including build dev tools)
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

# Copy package manifests and production dependencies
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm install --omit=dev

# Copy compiled backend and frontend distribution bundles
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 4000

CMD ["node", "backend/dist/server.js"]
