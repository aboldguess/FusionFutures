"""
============================================================================
File: services/api/src/fusion_futures_api/core/auth.py
Purpose: Configure authentication, roles, and security middleware for FastAPI.
Structure: Defines dependency functions for role enforcement and secure cookie handling.
Usage: Imported by routers to guard sensitive endpoints.
============================================================================
"""
from __future__ import annotations

from datetime import timedelta
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordBearer
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

from fusion_futures_api.core.settings import get_settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

ROLE_HEADER = "X-Fusion-Role"

class AuthContext:
    """Simple representation of the authenticated subject."""

    def __init__(self, email: str, role: str):
        self.email = email
        self.role = role

_serializer = URLSafeTimedSerializer(get_settings().secret_key)


async def get_current_user(request: Request, token: str = Depends(oauth2_scheme)) -> AuthContext:
    raw_token = token or request.cookies.get("fusion_auth")
    if not raw_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        data = _serializer.loads(raw_token, max_age=int(timedelta(hours=12).total_seconds()))
        return AuthContext(email=data["email"], role=data.get("role", "user"))
    except SignatureExpired as exc:  # pragma: no cover - defensive branch
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired") from exc
    except BadSignature as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


def require_role(required_role: str):
    async def dependency(context: AuthContext = Depends(get_current_user)) -> AuthContext:
        if context.role != required_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return context

    return dependency


def configure_auth(app: FastAPI) -> None:
    settings = get_settings()

    @app.post("/api/auth/token")
    async def issue_token(response: Response, email: str, role: str = "user"):
        token = _serializer.dumps({"email": email, "role": role})
        response.set_cookie(
            key="fusion_auth",
            value=token,
            httponly=True,
            secure=bool(settings.cookie_domain),
            samesite="lax",
            max_age=int(timedelta(hours=8).total_seconds()),
            domain=settings.cookie_domain,
        )
        return {"access_token": token, "token_type": "bearer"}


RoleDependency = Annotated[AuthContext, Depends(get_current_user)]
