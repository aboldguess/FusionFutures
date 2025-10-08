"""
============================================================================
File: services/api/src/fusion_futures_api/modules/users/__init__.py
Purpose: Expose router registration for the users module.
Structure: Imports router factory for plugin discovery.
Usage: Auto-registered during service boot.
============================================================================
"""
from __future__ import annotations

from fastapi import FastAPI

from .routes import router


def register(app: FastAPI):
    return [router]
