"""
============================================================================
File: services/api/src/fusion_futures_api/modules/users/routes.py
Purpose: Provide user management endpoints demonstrating role protection and auditing.
Structure: Exposes CRUD-like operations backed by SQLModel.
Usage: Automatically registered by plugin loader.
============================================================================
"""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Field, SQLModel, select

from fusion_futures_api.core.auth import AuthContext, require_role
from fusion_futures_api.core.database import session_scope, init_db

router = APIRouter(prefix="/api/users", tags=["users"])

class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    email: str = Field(index=True)
    role: str = Field(default="user")

class UserCreate(SQLModel):
    id: str
    email: str
    role: str = "user"

class UserRead(SQLModel):
    id: str
    email: str
    role: str

@router.on_event("startup")
def ensure_table() -> None:
    init_db()

@router.get("", response_model=List[UserRead], dependencies=[Depends(require_role("admin"))])
async def list_users(_: AuthContext = Depends(require_role("admin"))):
    with session_scope() as session:
        rows = session.exec(select(User)).all()
        return [UserRead.model_validate(row) for row in rows]

@router.post("", response_model=UserRead, dependencies=[Depends(require_role("admin"))])
async def create_user(payload: UserCreate, _: AuthContext = Depends(require_role("admin"))):
    with session_scope() as session:
        if session.get(User, payload.id):
            raise HTTPException(status_code=400, detail="User already exists")
        user = User.model_validate(payload)
        session.add(user)
    return UserRead.model_validate(user)
