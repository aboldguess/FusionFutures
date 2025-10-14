# Fusion Futures Monorepo

> **File Overview:**
> - **Purpose:** Acts as the primary onboarding and operations guide for the Fusion Futures monorepo.
> - **Structure:** Sections cover architecture, setup (Linux/Windows/Raspberry Pi), development workflows, debugging, security, and deployment.
> - **Usage:** Read sequentially when first cloning; jump to task-specific sections during day-to-day work.

## Architectural Overview

Fusion Futures is a security-first, developer-friendly monorepo comprised of:

- `apps/web`: Next.js 14 App Router interface with Auth.js, Tailwind, accessibility-first UI, and rich debugging hints.
- `services/api`: FastAPI + SQLModel backend using modular routers, event bus, role-based auth, and comprehensive observability.
- `packages/ui`: Shared React component library including the module registry consumed by the web app.
- `packages/types`: Generated TypeScript definitions sourced from the API's OpenAPI schema.
- `infra/docker`: Production-ready Docker and Caddy reverse proxy setup with Postgres and backup routines.
- Tooling: Python-based setup automation, CI pipelines, linting, formatting, and automated tests.

## Quick Start (Linux, macOS, WSL, Raspberry Pi OS)

```bash
# 1. Clone and enter the repository
 git clone https://example.com/FusionFutures.git
 cd FusionFutures

# 2. Prepare Node and Python environments (recommended via asdf)
# NOTE: Python 3.13 is not yet supported because pydantic-core wheels are unavailable for Windows users.
asdf install nodejs latest
asdf install python 3.12.3

# 3. Create and activate a project-local virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 4. Install Python requirements (upgrades pip tooling automatically)
python -m pip install --upgrade pip
python -m pip install -r reqs.txt

# 5. (Optional) Pre-install JavaScript dependencies so the first launch is faster
npm install

# 6. Launch the local preview (installs deps on first run if you skipped step 5)
python scripts/launch_fusionfutures_local.py

# Optional: use --help to view flags such as custom ports or production mode
python scripts/launch_fusionfutures_local.py --help
```

## Quick Start (Windows PowerShell)

```powershell
# 1. Clone and enter
 git clone https://example.com/FusionFutures.git
 Set-Location FusionFutures

# 2. Install Node + Python (e.g., winget)
# Stick with Python 3.12.x until pydantic publishes Windows wheels for 3.13 to avoid forced Rust builds.
winget install OpenJS.NodeJS.LTS
winget install Python.Python.3.12

# 3. Create and activate a project-local virtual environment
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1

# 4. Install Python requirements (upgrades pip tooling automatically)
python -m pip install --upgrade pip
python -m pip install -r reqs.txt

# 5. (Optional) Pre-install JavaScript dependencies so the first launch is faster
npm install

# 6. Launch the local preview (installs deps on first run if you skipped step 5)
py -3 scripts\launch_fusionfutures_local.py

# Optional: inspect available flags (e.g. custom ports or production mode)
py -3 scripts\launch_fusionfutures_local.py --help
```

> **Raspberry Pi Note:** Replace Node.js/Python installers above with `sudo apt install nodejs npm python3 python3-venv` or use `asdf` from source.
>
> **Docker-focused workflow:** When you are ready to evaluate the fully containerised stack, switch back to `python scripts/fusionfutures_setup.py` which provisions Docker services alongside dependency installation.

### Setup Automation Flags

- `python scripts/fusionfutures_setup.py --skip-install` &mdash; reuse existing dependencies and only restart Docker.
- `python scripts/fusionfutures_setup.py --skip-types` &mdash; skip TypeScript generation if the API schema is unreachable.
- `python scripts/fusionfutures_setup.py --allow-type-failures` &mdash; continue running even when schema generation fails (useful offline).
- `python scripts/fusionfutures_setup.py --skip-docker` &mdash; prepare dependencies without starting containers (e.g., CI runs).

The setup helper validates the presence of Docker, Node.js, and npm up front, printing actionable remediation hints for any
missing prerequisite before exiting to keep you informed.

### Local Preview Script Flags

- `--frontend-port` / `--frontend-host` &mdash; expose the Next.js UI on a custom interface or port (defaults to `127.0.0.1:3100`).
- `--backend-port` / `--backend-host` &mdash; control the FastAPI server binding (defaults to `127.0.0.1:8000`).
- `--mode production` &mdash; pre-build the Next.js app and run it with `next start` instead of the hot-reloading dev server.
- `--skip-installs` &mdash; assume dependencies are already installed to speed up repeated launches.
- `--verbose` &mdash; print detailed setup logs, ideal for debugging permission or tooling issues.

The script sets `FUSION_FUTURES_FRONTEND_ORIGIN` automatically so API CORS rules match your chosen frontend URL, streams service logs with clear prefixes, and shuts both processes down cleanly when you press `Ctrl+C`.

## Debugging Essentials

- **Structured Logging:** Both frontend and backend emit JSON-formatted logs annotated with correlation IDs.
- **On-Screen Guidance:** The web UI exposes a collapsible “Debug Console” banner showing API health, log hints, and safe-mode toggles.
- **CLI Visibility:** `docker compose -f infra/docker/docker-compose.yml --project-name fusion_futures logs -f --tail=200` tails
  Docker and application logs with color-coded severity markers.
- **Tracing Requests:** Outbound requests attach an `X-Request-ID` header allowing cross-service correlation.

### Troubleshooting npm Detection

- **Symptom:** `Command 'npm' could not be found` during `scripts/launch_fusionfutures_local.py`.
- **Root Cause:** Node.js (which bundles npm) is either not installed or not on your PATH.
- **Resolution (Linux/macOS/WSL/Raspberry Pi OS):** Install Node.js via `asdf install nodejs latest`, `brew install node`, or your distribution package manager. Verify with `node --version` and `npm --version`.
- **Resolution (Windows PowerShell):** Install Node.js using `winget install OpenJS.NodeJS.LTS` or from the official MSI installer, then restart PowerShell to refresh PATH variables.
- **Verification:** `npm --version` should print a semantic version (e.g., `10.8.1`). If the launcher still fails, re-run with `--verbose` to surface the resolved npm path in the logs.

### Troubleshooting `pip install -e services/api`

- **Symptom:** `pip` reports `Cargo, the Rust package manager, is not installed` when preparing pydantic-core metadata.
- **Root Cause:** When using Python 3.13 on Windows, pydantic-core currently lacks prebuilt wheels. Pip therefore falls back to compiling Rust sources, which fails without Cargo.
- **Resolution:** Use Python 3.12.x (documented above) or install the Rust toolchain before installing. After downgrading/creating a Python 3.12 environment, rerun `pip install -e services/api[dev]`.
- **Verification:** Run `python -c "import sys; print(sys.version)"` and ensure the minor version is `3.12` prior to installing dependencies.

## Security Practices

- Strict dependency pinning to reputable, actively maintained libraries.
- Auth.js backed by secure cookies, CSRF tokens, and role-aware session guards.
- FastAPI implements rate limiting, audit trails, and structured error responses (RFC 7807 problem+json).
- Secrets are externalized via environment templates (`.env.example`).

## Testing & Quality Gates

- `npm run lint --workspaces` for ESLint + Prettier.
- `npm run test --workspaces` for unit tests (React Testing Library + Vitest).
- `pytest` for backend unit and integration tests.
- `pytest services/api/tests/test_health.py services/api/tests/test_demo_crud.py` runs backend smoke tests hitting `/api/healthz`
  and CRUD endpoints (mirrors the automated smoke coverage).
- CI enforces linting, typing, and test suites via GitHub Actions.

## Deployment Snapshot

- `infra/docker/docker-compose.yml` orchestrates Caddy, Next.js, FastAPI, Postgres, pgAdmin, and scheduled backups.
- `scripts/deploy.sh` builds and pushes Docker images with environment-aware tagging before running infrastructure migrations.

## Support & Contributions

1. Review coding conventions embedded in per-file headers and AGENTS (when present).
2. Use `python scripts/fusionfutures_setup.py --help` to explore automation flags.
3. Submit PRs ensuring linting/tests pass and referencing setup script usage where relevant.

Happy building — and keep security, clarity, and empathy front-of-mind.
