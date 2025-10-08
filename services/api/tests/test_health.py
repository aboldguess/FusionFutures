"""
============================================================================
File: services/api/tests/test_health.py
Purpose: Validate health endpoints respond successfully.
Structure: Uses FastAPI TestClient to call readiness endpoint.
Usage: Executed via pytest in CI.
============================================================================
"""
from fastapi.testclient import TestClient

from fusion_futures_api.service_entrypoint import create_app


def test_healthz():
    with TestClient(create_app()) as client:
        response = client.get("/api/healthz")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
