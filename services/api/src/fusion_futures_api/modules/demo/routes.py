"""
============================================================================
File: services/api/src/fusion_futures_api/modules/demo/routes.py
Purpose: Provide demo data endpoints showcasing CRUD/search operations.
Structure: Defines SQLModel entities, routers, and service functions.
Usage: Registered by the plugin loader at startup.
============================================================================
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from sqlmodel import Field, SQLModel, select

from fusion_futures_api.core.auth import AuthContext, require_role
from fusion_futures_api.core.database import session_scope, init_db
from fusion_futures_api.core.csrf import CsrfDependency, issue_csrf
from fusion_futures_api.events.bus import EventBus

router = APIRouter(prefix="/api/demo-data", tags=["demo"])

class DemoItem(SQLModel, table=True):
    id: str = Field(primary_key=True)
    title: str
    metric: str
    searchable: str = Field(default="", index=True)

class DemoItemCreate(SQLModel):
    id: str
    title: str
    metric: str

class DemoItemRead(SQLModel):
    id: str
    title: str
    metric: str

@router.on_event("startup")
def bootstrap_table() -> None:
    init_db()
    with session_scope() as session:
        if not session.exec(select(DemoItem)).first():
            session.add_all(
                [
                    DemoItem(id="1", title="Active pilots", metric="18", searchable="pilots"),
                    DemoItem(id="2", title="AI initiatives", metric="5", searchable="ai"),
                ]
            )


@router.get("/csrf-token", response_model=dict)
async def get_csrf_token(response: Response):
    token = issue_csrf(response)
    return {"csrfToken": token}

@router.get("", response_model=dict)
async def list_demo_items(q: str | None = Query(default=None, description="Full-text search query")):
    with session_scope() as session:
        statement = select(DemoItem)
        if q:
            statement = statement.where(DemoItem.searchable.contains(q))
        results = session.exec(statement).all()
    return {"items": [DemoItemRead.model_validate(item).model_dump() for item in results]}

@router.post(
    "",
    response_model=DemoItemRead,
    dependencies=[Depends(require_role("admin")), CsrfDependency],
)
async def create_demo_item(
    payload: DemoItemCreate,
    request: Request,
    context: AuthContext = Depends(require_role("admin")),
):
    _ = context
    with session_scope() as session:
        if session.get(DemoItem, payload.id):
            raise HTTPException(status_code=400, detail="Item already exists")
        item = DemoItem(id=payload.id, title=payload.title, metric=payload.metric, searchable=payload.title.lower())
        session.add(item)
    event_bus: EventBus = request.app.state.event_bus
    event_bus.publish("demo.created", item.model_dump())
    return DemoItemRead.model_validate(item)
