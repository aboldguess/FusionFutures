# ============================================================================
# File: infra/docker/services/web.Dockerfile
# Purpose: Build the Next.js web application for production deployment.
# Structure: Multi-stage build producing optimized static output.
# Usage: Referenced by docker-compose and CI pipelines.
# ============================================================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages
# Install workspace dependencies with npm so all packages share a single lockfile.
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace fusion-futures-web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages
# Reinstall dependencies in production mode to exclude development-only packages.
RUN npm ci --omit=dev
COPY --from=builder /app/apps/web/.next ./.next
COPY apps/web/public ./public
EXPOSE 3100
CMD ["npm", "run", "start", "--workspace", "fusion-futures-web"]
