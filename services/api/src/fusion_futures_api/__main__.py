"""
============================================================================
File: services/api/src/fusion_futures_api/__main__.py
Purpose: Allow running the API via `python -m fusion_futures_api`.
Structure: Bootstraps uvicorn server with recommended settings.
Usage: Suitable for local debugging; production uses docker-compose services.
============================================================================
"""
from __future__ import annotations

import uvicorn

if __name__ == "__main__":
    uvicorn.run("fusion_futures_api.service_entrypoint:create_app", factory=True, host="0.0.0.0", port=8000, reload=True)
