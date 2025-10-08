"""
============================================================================
File: services/api/src/fusion_futures_api/core/csrf.py
Purpose: Offer lightweight double-submit cookie CSRF protection utilities.
Structure: Provides token generator, FastAPI dependency, and helper to set cookie.
Usage: Imported by routers handling state-changing operations.
============================================================================
"""
from __future__ import annotations

import secrets

from fastapi import Depends, HTTPException, Request, Response, status

from fusion_futures_api.core.settings import get_settings

CSRF_COOKIE_NAME = "fusion_csrf"
CSRF_HEADER_NAME = "X-CSRF-Token"


def issue_csrf(response: Response) -> str:
    settings = get_settings()
    token = secrets.token_urlsafe(32)
    response.set_cookie(
        CSRF_COOKIE_NAME,
        token,
        httponly=False,
        secure=bool(settings.cookie_domain),
        samesite="lax",
        domain=settings.cookie_domain,
    )
    return token

async def verify_csrf(request: Request) -> None:
    cookie_token = request.cookies.get(CSRF_COOKIE_NAME)
    header_token = request.headers.get(CSRF_HEADER_NAME)
    if not cookie_token or not header_token or cookie_token != header_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF validation failed")

CsrfDependency = Depends(verify_csrf)
