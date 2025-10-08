"""
============================================================================
File: services/api/src/fusion_futures_api/core/middleware.py
Purpose: Define reusable middleware for audit logging, correlation IDs, and secure sessions.
Structure: Provides helper functions to attach middleware to FastAPI app.
Usage: Imported in service_entrypoint during app creation.
============================================================================
"""
from __future__ import annotations

import logging
import secrets
import time
from typing import Callable

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware

from fusion_futures_api.core.logging import CORRELATION_KEY
from fusion_futures_api.core.settings import get_settings

def add_correlation_middleware(app: FastAPI) -> None:
    class CorrelationMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next: Callable):
            correlation_id = request.headers.get("X-Request-ID") or secrets.token_hex(8)
            request.state.correlation_id = correlation_id
            response = await call_next(request)
            response.headers["X-Request-ID"] = correlation_id
            return response

    app.add_middleware(CorrelationMiddleware)

def add_audit_logging(app: FastAPI) -> None:
    logger = logging.getLogger("fusion.audit")

    class AuditMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next: Callable):
            start = time.perf_counter()
            response = await call_next(request)
            duration = (time.perf_counter() - start) * 1000
            logger.info(
                "request",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status": response.status_code,
                    "duration_ms": f"{duration:.2f}",
                    CORRELATION_KEY: getattr(request.state, "correlation_id", "unknown"),
                },
            )
            return response

    app.add_middleware(AuditMiddleware)

def add_secure_cookie_session(app: FastAPI) -> None:
    settings = get_settings()
    app.add_middleware(
        SessionMiddleware,
        secret_key=settings.secret_key,
        https_only=True,
        same_site="lax",
        session_cookie="fusion_session",
        max_age=60 * 60 * 8,
    )

def add_problem_details_handler(app: FastAPI) -> None:
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        problem = {
            "type": "https://fusionfutures.dev/problems/internal-error",
            "title": "Internal server error",
            "status": 500,
            "detail": str(exc),
            "instance": str(request.url),
        }
        return JSONResponse(problem, status_code=500)
