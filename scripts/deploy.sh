#!/usr/bin/env bash
# ============================================================================
# File: scripts/deploy.sh
# Purpose: Automate building and deploying Fusion Futures containers to production.
# Structure: Builds images, pushes to registry, and applies docker-compose stack.
# Usage: Run from CI/CD environment with proper credentials.
# ============================================================================
set -euo pipefail
REGISTRY="registry.example.com/fusion-futures"
TAG=${1:-$(date +"%Y%m%d%H%M")}

echo "🚀 Building production images with tag ${TAG}" 
DOCKER_BUILDKIT=1 docker build -f infra/docker/services/web.Dockerfile -t ${REGISTRY}/web:${TAG} .
DOCKER_BUILDKIT=1 docker build -f infra/docker/services/api.Dockerfile -t ${REGISTRY}/api:${TAG} .

echo "📦 Pushing images to registry"
docker push ${REGISTRY}/web:${TAG}
docker push ${REGISTRY}/api:${TAG}

echo "🔄 Deploying stack"
ssh deploy@production-host "docker pull ${REGISTRY}/web:${TAG} && docker pull ${REGISTRY}/api:${TAG} && TAG=${TAG} docker compose -f /opt/fusion/docker-compose.yml up -d"
