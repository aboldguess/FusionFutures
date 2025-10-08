# ============================================================================
# File: infra/docker/services/web.Dockerfile
# Purpose: Build the Next.js web application for production deployment.
# Structure: Multi-stage build producing optimized static output.
# Usage: Referenced by docker-compose and CI pipelines.
# ============================================================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm --filter fusion-futures-web build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next ./.next
COPY apps/web/public ./public
COPY apps/web/package.json ./package.json
RUN corepack enable && pnpm install --prod --filter fusion-futures-web
EXPOSE 3100
CMD ["pnpm", "--filter", "fusion-futures-web", "start"]
