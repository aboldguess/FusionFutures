"""
============================================================================
File: services/api/src/fusion_futures_api/service_entrypoint.py
Purpose: Instantiate the FastAPI application, load module routers, and configure middleware.
Structure: Defines application factory, plugin loader, and router registration logic.
Usage: Imported by uvicorn (`uvicorn fusion_futures_api.service_entrypoint:create_app`).
============================================================================
"""
from __future__ import annotations

import importlib
import os
import pkgutil
from typing import Callable, List

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from fusion_futures_api.core.auth import configure_auth
from fusion_futures_api.core.logging import configure_logging
from fusion_futures_api.core.middleware import (
    add_audit_logging,
    add_correlation_middleware,
    add_problem_details_handler,
    add_secure_cookie_session,
)
from fusion_futures_api.events.bus import EventBus

MODULE_PACKAGE = "fusion_futures_api.modules"
DEFAULT_FRONTEND_ORIGIN = "http://localhost:3100"

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])


def _resolve_frontend_origins() -> List[str]:
    """Return the list of allowed CORS origins for the frontend."""

    configured = os.getenv("FUSION_FUTURES_FRONTEND_ORIGIN", DEFAULT_FRONTEND_ORIGIN)
    # Support comma-separated values so multiple preview URLs can be authorised without
    # code edits. Empty entries are filtered out to avoid FastAPI warnings.
    origins = [origin.strip() for origin in configured.split(",") if origin.strip()]
    if not origins:
        return [DEFAULT_FRONTEND_ORIGIN]
    return origins

def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    configure_logging()

    app = FastAPI(title="Fusion Futures API", version="0.1.0")
    add_problem_details_handler(app)
    add_correlation_middleware(app)
    add_secure_cookie_session(app)
    add_audit_logging(app)

    app.state.event_bus = EventBus()

    async def log_demo_created(event: dict) -> None:
        app.logger.info("demo.created", extra={"event": event})

    app.state.event_bus.subscribe("demo.created", log_demo_created)
    configure_auth(app)

    allowed_origins = _resolve_frontend_origins()
    app.logger.info("Configuring CORS for origins: %s", allowed_origins)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.state.limiter = limiter

    register_health_routes(app)
    register_module_routers(app)

    @app.exception_handler(RateLimitExceeded)
    def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        """Return RFC7807-compliant response when rate limit is exceeded."""
        problem = {
            "type": "https://fusionfutures.dev/problems/rate-limit",
            "title": "Rate limit exceeded",
            "status": 429,
            "detail": str(exc),
            "instance": str(request.url),
        }
        return JSONResponse(problem, status_code=429)

    return app

def register_health_routes(app: FastAPI) -> None:
    """Attach health and readiness endpoints."""

    @app.get("/api/healthz", tags=["health"], summary="Readiness probe")
    async def healthz():
        return {"status": "ok"}

    @app.get("/api/livez", tags=["health"], summary="Liveness probe")
    async def livez():
        return {"status": "alive"}

def register_module_routers(app: FastAPI) -> None:
    """Auto-discover modules under the modules package and register routers."""
    package = importlib.import_module(MODULE_PACKAGE)
    for module_info in pkgutil.iter_modules(package.__path__, package.__name__ + "."):
        module = importlib.import_module(module_info.name)
        router_factory: Callable[[FastAPI], List] | None = getattr(module, "register", None)
        if router_factory:
            for router in router_factory(app):
                app.include_router(router)

__all__ = ["create_app"]
