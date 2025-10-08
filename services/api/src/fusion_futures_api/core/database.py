"""
============================================================================
File: services/api/src/fusion_futures_api/core/database.py
Purpose: Configure SQLModel engine and session utilities.
Structure: Provides engine factory, session context manager, and metadata export.
Usage: Imported by modules requiring database access or migrations.
============================================================================
"""
from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from sqlmodel import Session, SQLModel, create_engine

from fusion_futures_api.core.settings import get_settings

_engine = None

def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
        _engine = create_engine(settings.database_url, echo=False, connect_args=connect_args)
    return _engine

@contextmanager
def session_scope() -> Iterator[Session]:
    session = Session(get_engine())
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def init_db() -> None:
    SQLModel.metadata.create_all(get_engine())
