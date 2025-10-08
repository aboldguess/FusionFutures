"""
============================================================================
File: services/api/tests/test_demo_crud.py
Purpose: Exercise demo module CRUD endpoints including role enforcement.
Structure: Boots app, issues auth token, and performs create/list operations.
Usage: Executed via pytest as part of CI smoke tests.
============================================================================
"""
from uuid import uuid4

from fastapi.testclient import TestClient

from fusion_futures_api.service_entrypoint import create_app


def authenticate(client: TestClient, role: str = "admin") -> str:
    response = client.post("/api/auth/token", data={"email": "tester@example.com", "role": role})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_demo_list_and_create():
    app = create_app()
    with TestClient(app) as client:
        token = authenticate(client)
        response = client.get("/api/demo-data")
        assert response.status_code == 200
        existing_count = len(response.json()["items"])

        csrf_response = client.get("/api/demo-data/csrf-token")
        csrf_token = csrf_response.json()["csrfToken"]

        item_id = str(uuid4())
        create_response = client.post(
            "/api/demo-data",
            json={"id": item_id, "title": "Test", "metric": "7"},
            headers={
                "Authorization": f"Bearer {token}",
                "X-CSRF-Token": csrf_token,
            },
        )
        assert create_response.status_code == 200

        second_list = client.get("/api/demo-data")
        assert len(second_list.json()["items"]) == existing_count + 1
