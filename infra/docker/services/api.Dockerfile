# ============================================================================
# File: infra/docker/services/api.Dockerfile
# Purpose: Containerize FastAPI service with security-conscious defaults.
# Structure: Installs dependencies and runs uvicorn with reload disabled.
# Usage: Built via docker-compose.
# ============================================================================
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*
COPY services/api/pyproject.toml services/api/ /app/
RUN pip install --upgrade pip && pip install .[dev]
COPY services/api/src /app/src
EXPOSE 8000
CMD ["uvicorn", "fusion_futures_api.service_entrypoint:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
