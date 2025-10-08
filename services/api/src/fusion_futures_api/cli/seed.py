"""
============================================================================
File: services/api/src/fusion_futures_api/cli/seed.py
Purpose: Provide CLI entry point to seed the database with demo records.
Structure: Creates users and demo items leveraging SQLModel models.
Usage: Run via `python -m fusion_futures_api.cli.seed`.
============================================================================
"""
from __future__ import annotations

from fusion_futures_api.core.database import session_scope, init_db
from fusion_futures_api.modules.demo.routes import DemoItem
from fusion_futures_api.modules.users.routes import User

SEED_USERS = [
    User(id="admin-1", email="admin@fusionfutures.dev", role="admin"),
    User(id="user-1", email="user@fusionfutures.dev", role="user"),
]

SEED_ITEMS = [
    DemoItem(id="seed-1", title="Adoption score", metric="82", searchable="adoption"),
]

def main() -> None:
    init_db()
    with session_scope() as session:
        for user in SEED_USERS:
            if not session.get(User, user.id):
                session.add(user)
        for item in SEED_ITEMS:
            if not session.get(DemoItem, item.id):
                session.add(item)
    print("✅ Seeded demo users and items")

if __name__ == "__main__":
    main()
