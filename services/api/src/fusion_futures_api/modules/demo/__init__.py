"""
============================================================================
File: services/api/src/fusion_futures_api/modules/demo/__init__.py
Purpose: Expose router registration for the demo module.
Structure: Imports router factory and re-exports register function expected by plugin loader.
Usage: Auto-discovered in service_entrypoint.
============================================================================
"""
from __future__ import annotations

from fastapi import FastAPI

from .routes import router


def register(app: FastAPI):
    return [router]
