#!/usr/bin/env python3
"""
===============================================================================
File: scripts/launch_fusionfutures_local.py
Purpose: Provide a one-command, Docker-free launcher for the Fusion Futures web
         platform so evaluators can run the FastAPI backend and Next.js frontend
         locally with sensible defaults.
Structure: Defines CLI argument parsing, prerequisite validation, dependency
           bootstrapping (virtual environment + pnpm), and asynchronous process
           orchestration with rich logging for quick debugging.
Usage: Run `python scripts/launch_fusionfutures_local.py` (Linux/macOS/Raspberry
       Pi) or `py -3 scripts\\launch_fusionfutures_local.py` (Windows PowerShell)
       to install dependencies (unless skipped) and start both services.
===============================================================================
"""
from __future__ import annotations

import argparse
import asyncio
import logging
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Dict, Iterable, Optional

REPO_ROOT = Path(__file__).resolve().parents[1]
VENV_DIR = REPO_ROOT / ".venv"
PYTHON_MIN_VERSION = (3, 11)
DEFAULT_FRONTEND_PORT = 3100
DEFAULT_BACKEND_PORT = 8000


class LaunchError(RuntimeError):
    """Raised when launching the local environment fails."""


def configure_logging(verbose: bool) -> None:
    """Initialise structured console logging for transparent debugging."""

    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)-8s | %(message)s",
        datefmt="%H:%M:%S",
    )


def parse_args(argv: Optional[Iterable[str]] = None) -> argparse.Namespace:
    """Build and parse command-line options for the launcher."""

    parser = argparse.ArgumentParser(
        description=(
            "Launch the Fusion Futures FastAPI backend and Next.js frontend without Docker. "
            "The script installs dependencies on first run and streams logs for both services."
        )
    )
    parser.add_argument(
        "--frontend-port",
        type=int,
        default=DEFAULT_FRONTEND_PORT,
        help="Port to expose the Next.js frontend on (default: %(default)s)",
    )
    parser.add_argument(
        "--frontend-host",
        default="127.0.0.1",
        help="Hostname/interface for the Next.js dev server (default: %(default)s)",
    )
    parser.add_argument(
        "--backend-port",
        type=int,
        default=DEFAULT_BACKEND_PORT,
        help="Port to expose the FastAPI backend on (default: %(default)s)",
    )
    parser.add_argument(
        "--backend-host",
        default="127.0.0.1",
        help="Hostname/interface for the FastAPI server (default: %(default)s)",
    )
    parser.add_argument(
        "--mode",
        choices={"dev", "production"},
        default="dev",
        help="Run the Next.js app in dev (hot reload) or production (build + start) mode.",
    )
    parser.add_argument(
        "--skip-installs",
        action="store_true",
        help="Skip dependency installation to accelerate subsequent runs.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging for troubleshooting setup issues.",
    )
    return parser.parse_args(argv)


def check_prerequisites() -> None:
    """Ensure core tooling and interpreter requirements are met before launching."""

    if sys.version_info < PYTHON_MIN_VERSION:
        version = platform.python_version()
        raise LaunchError(
            "Python {major}.{minor}+ is required for the launcher. Current interpreter reports {version}.".format(
                major=PYTHON_MIN_VERSION[0],
                minor=PYTHON_MIN_VERSION[1],
                version=version,
            )
        )

    required_tools = {
        "pnpm": "Install pnpm from https://pnpm.io/installation or via `npm install -g pnpm@latest`.",
    }

    missing = []
    for tool, hint in required_tools.items():
        if shutil.which(tool) is None:
            logging.error("Required tool '%s' not found. Hint: %s", tool, hint)
            missing.append(tool)
        else:
            logging.debug("Found %s at %s", tool, shutil.which(tool))

    if missing:
        raise LaunchError(
            "Missing required tooling: {tools}. Install the listed tools and rerun the launcher.".format(
                tools=", ".join(missing)
            )
        )


def _venv_executable(executable: str) -> Path:
    """Return the platform-correct path for a virtualenv executable."""

    if platform.system().lower().startswith("win"):
        return VENV_DIR / "Scripts" / f"{executable}.exe"
    return VENV_DIR / "bin" / executable


def ensure_virtualenv() -> None:
    """Create a repository-local virtual environment if it does not already exist."""

    if VENV_DIR.exists():
        logging.debug("Virtual environment already exists at %s", VENV_DIR)
        return

    logging.info("Creating Python virtual environment in %s", VENV_DIR)
    subprocess.run([sys.executable, "-m", "venv", str(VENV_DIR)], check=True)


def run_command(command: Iterable[str], description: str, cwd: Optional[Path] = None, env: Optional[Dict[str, str]] = None) -> None:
    """Execute a subprocess while streaming its combined stdout/stderr for transparency."""

    logging.info("▶️ %s", description)
    process = subprocess.Popen(
        list(command),
        cwd=str(cwd or REPO_ROOT),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    assert process.stdout is not None
    for line in process.stdout:
        logging.info("%s", line.rstrip())
    process.wait()
    if process.returncode != 0:
        raise LaunchError(f"Command '{' '.join(command)}' failed with exit code {process.returncode}")
    logging.info("✅ %s completed", description)


def install_dependencies(skip_installs: bool) -> None:
    """Install Node and Python dependencies unless the user opted out."""

    if skip_installs:
        logging.info("Skipping dependency installation as requested. Ensure dependencies are already installed.")
        return

    ensure_virtualenv()

    pip_executable = _venv_executable("pip")
    run_command([str(pip_executable), "install", "--upgrade", "pip", "setuptools", "wheel"], "Upgrading pip tooling")
    run_command(
        [str(pip_executable), "install", "-e", "services/api"],
        "Installing FastAPI service dependencies",
    )

    run_command(["pnpm", "install"], "Installing pnpm workspace dependencies", cwd=REPO_ROOT)


def build_frontend_if_needed(mode: str) -> None:
    """Build the Next.js frontend when the user requests production mode."""

    if mode != "production":
        return

    run_command(
        ["pnpm", "--filter", "fusion-futures-web", "build"],
        "Building Next.js frontend for production",
        cwd=REPO_ROOT,
    )


def _format_origin(host: str, port: int) -> str:
    """Construct the frontend origin URL used for CORS configuration."""

    scheme = "http"
    return f"{scheme}://{host}:{port}"


async def _stream_process_output(name: str, process: asyncio.subprocess.Process) -> None:
    """Stream subprocess output with a name prefix so users can distinguish services."""

    assert process.stdout is not None
    async for line in process.stdout:
        logging.info("[%s] %s", name, line.rstrip())


async def _terminate_process(name: str, process: asyncio.subprocess.Process) -> None:
    """Terminate a subprocess gracefully, falling back to kill if required."""

    if process.returncode is not None:
        return

    logging.info("Stopping %s process...", name)
    try:
        process.terminate()
        await asyncio.wait_for(process.wait(), timeout=5)
    except asyncio.TimeoutError:
        logging.warning("Process %s did not exit in time; killing.", name)
        process.kill()
        await process.wait()


async def launch_process(name: str, command: Iterable[str], env: Dict[str, str]) -> None:
    """Launch a subprocess, stream its output, and raise if it exits unexpectedly."""

    process = await asyncio.create_subprocess_exec(
        *command,
        cwd=str(REPO_ROOT),
        env=env,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )
    try:
        await _stream_process_output(name, process)
        returncode = await process.wait()
        if returncode != 0:
            raise LaunchError(f"{name} process exited with code {returncode}")
    except asyncio.CancelledError:
        await _terminate_process(name, process)
        raise


def resolve_python_interpreter() -> str:
    """Return the path to the virtualenv's Python interpreter."""

    python_path = _venv_executable("python")
    if not python_path.exists():
        raise LaunchError(
            f"Could not find Python executable at {python_path}. Run the launcher without --skip-installs to provision dependencies."
        )
    return str(python_path)


def build_backend_command(host: str, port: int, dev_mode: bool) -> Iterable[str]:
    """Construct the uvicorn command respecting host/port and reload preferences."""

    python_path = resolve_python_interpreter()
    command = [
        python_path,
        "-m",
        "uvicorn",
        "fusion_futures_api.service_entrypoint:create_app",
        "--factory",
        "--host",
        host,
        "--port",
        str(port),
    ]
    if dev_mode:
        command.append("--reload")
    return command


def build_frontend_command(mode: str) -> Iterable[str]:
    """Return the pnpm command to start the Next.js frontend in the requested mode."""

    if mode == "production":
        return ["pnpm", "--filter", "fusion-futures-web", "start"]
    return ["pnpm", "--filter", "fusion-futures-web", "dev"]


async def launch_services(args: argparse.Namespace) -> None:
    """Launch the backend and frontend concurrently and monitor their lifecycles."""

    frontend_origin = _format_origin(args.frontend_host, args.frontend_port)
    backend_env = os.environ.copy()
    backend_env.update(
        {
            "FUSION_FUTURES_FRONTEND_ORIGIN": frontend_origin,
        }
    )

    frontend_env = os.environ.copy()
    frontend_env.update(
        {
            "PORT": str(args.frontend_port),
            "HOST": args.frontend_host,
        }
    )

    backend_command = list(build_backend_command(args.backend_host, args.backend_port, dev_mode=args.mode == "dev"))
    frontend_command = list(build_frontend_command(args.mode))

    logging.info("Starting services... Frontend: %s, Backend: %s", frontend_command, backend_command)
    backend_task = asyncio.create_task(launch_process("API", backend_command, backend_env))
    frontend_task = asyncio.create_task(launch_process("Web", frontend_command, frontend_env))

    try:
        done, pending = await asyncio.wait({backend_task, frontend_task}, return_when=asyncio.FIRST_EXCEPTION)
        for task in done:
            task.result()  # Propagate exceptions if any.
    finally:
        for task in {backend_task, frontend_task}:
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass

    logging.info(
        "Fusion Futures is now running! Open %s in your browser. Press Ctrl+C to stop both services.",
        frontend_origin,
    )


def main(argv: Optional[Iterable[str]] = None) -> int:
    """Entry point for the launcher script."""

    args = parse_args(argv)
    configure_logging(args.verbose)

    try:
        check_prerequisites()
        install_dependencies(args.skip_installs)
        build_frontend_if_needed(args.mode)
        asyncio.run(launch_services(args))
        return 0
    except LaunchError as exc:
        logging.error("%s", exc)
        return 1
    except KeyboardInterrupt:
        logging.info("Received keyboard interrupt. Shutting down services.")
        return 130


if __name__ == "__main__":
    sys.exit(main())
