# ============================================================================
# File: Makefile
# Purpose: Centralized automation for development, testing, and deployment tasks.
# Structure: Defines phony targets orchestrating Docker, seeding, and type generation.
# Usage: Run `make <target>` from repository root.
# ============================================================================
SHELL := /bin/bash

export COMPOSE_FILE := infra/docker/docker-compose.yml
export PROJECT_NAME := fusion_futures

.PHONY: help
help:
@echo "Available targets:"
@grep -E '^[a-zA-Z_-]+:.*?#' Makefile | awk 'BEGIN {FS = ":.*?#"} {printf "  %-20s %s\n", $$1, $$2}'

.PHONY: dev
dev: # Start full stack (web, api, postgres, proxy)
pnpm install
python -m venv .venv && . .venv/bin/activate && pip install -e services/api[dev] || true
docker compose -f $(COMPOSE_FILE) --project-name $(PROJECT_NAME) up --build -d
@echo "Web UI available on http://localhost:3100"
@echo "API available on http://localhost:8000"

.PHONY: build
build: # Build Docker images for production
docker compose -f $(COMPOSE_FILE) --project-name $(PROJECT_NAME) build

.PHONY: up
up: # Start stack without rebuilding
docker compose -f $(COMPOSE_FILE) --project-name $(PROJECT_NAME) up -d

.PHONY: down
down: # Stop stack and remove containers
docker compose -f $(COMPOSE_FILE) --project-name $(PROJECT_NAME) down

.PHONY: seed
seed: # Seed database with demo data
@if [ ! -d .venv ]; then python -m venv .venv && . .venv/bin/activate && pip install -e services/api[dev]; fi
. .venv/bin/activate && python -m fusion_futures_api.cli.seed

.PHONY: logs
logs: # Tail combined docker logs with timestamps
docker compose -f $(COMPOSE_FILE) --project-name $(PROJECT_NAME) logs -f --tail=200

.PHONY: types
types: # Generate API-driven TypeScript definitions
node scripts/generate-types.mjs || true

.PHONY: test
test: # Run full test suite (frontend + backend)
pnpm test
@if [ ! -d .venv ]; then python -m venv .venv && . .venv/bin/activate && pip install -e services/api[dev]; fi
. .venv/bin/activate && pytest

.PHONY: lint
lint: # Run linters across stack
pnpm lint
@if [ ! -d .venv ]; then python -m venv .venv && . .venv/bin/activate && pip install -e services/api[dev]; fi
. .venv/bin/activate && ruff check services/api/src
. .venv/bin/activate && black --check services/api/src

.PHONY: e2e
e2e: # Minimal e2e smoke tests via pytest client
@if [ ! -d .venv ]; then python -m venv .venv && . .venv/bin/activate && pip install -e services/api[dev]; fi
. .venv/bin/activate && pytest services/api/tests/test_health.py services/api/tests/test_demo_crud.py
