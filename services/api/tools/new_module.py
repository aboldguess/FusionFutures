"""
============================================================================
File: services/api/tools/new_module.py
Purpose: CLI scaffolder for generating new API modules under services/api/modules.
Structure: Parses command-line arguments, creates directory, and seeds router template.
Usage: Execute `python -m tools.new_module <name>` from repository root.
============================================================================
"""
from __future__ import annotations

import argparse
from pathlib import Path

TEMPLATE = """\
\"\"\"
============================================================================
File: services/api/src/fusion_futures_api/modules/{name}/routes.py
Purpose: Auto-generated router for the {name} module.
Structure: Provides placeholder endpoint and registration hook.
Usage: Customize models, dependencies, and routes to fit your module.
============================================================================
\"\"\"
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/api/{name}", tags=["{name}"])

@router.get("", summary="Describe the {name} endpoint")
async def describe_{name}():
    return {{"message": "{name} module ready"}}
"""

INIT_TEMPLATE = """\
\"\"\"
============================================================================
File: services/api/src/fusion_futures_api/modules/{name}/__init__.py
Purpose: Register the {name} router with the application plugin loader.
Structure: Exposes a register(app) function returning routers.
Usage: Automatically imported during application startup.
============================================================================
\"\"\"
from __future__ import annotations

from fastapi import FastAPI

from .routes import router


def register(app: FastAPI):
    return [router]
"""


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a new Fusion Futures API module")
    parser.add_argument("name", help="Module name, e.g. inventory")
    args = parser.parse_args()

    module_dir = Path(__file__).resolve().parents[1] / "src" / "fusion_futures_api" / "modules" / args.name
    module_dir.mkdir(parents=True, exist_ok=True)

    routes_path = module_dir / "routes.py"
    init_path = module_dir / "__init__.py"

    if routes_path.exists():
        raise SystemExit(f"Module {args.name} already exists")

    routes_path.write_text(TEMPLATE.format(name=args.name), encoding="utf-8")
    init_path.write_text(INIT_TEMPLATE.format(name=args.name), encoding="utf-8")
    print(f"✅ Created module skeleton at {module_dir}")

if __name__ == "__main__":
    main()
