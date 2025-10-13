#!/usr/bin/env python3
"""
===============================================================================
File: scripts/fusionfutures_setup.py
Purpose: Cross-platform automation to bootstrap dependencies and launch Fusion Futures services without GNU Make.
Structure: Command-line utility orchestrating prerequisite checks, dependency installation, virtualenv provisioning,
           and Docker Compose start-up with verbose logging and graceful error handling.
Usage: Run `python scripts/fusionfutures_setup.py` (Linux/macOS/Raspberry Pi) or `py -3 scripts\\fusionfutures_setup.py`
       (Windows PowerShell) to install dependencies and start the Docker stack. Use `--help` for advanced options.
===============================================================================
"""
from __future__ import annotations

import argparse
import logging
import platform
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable, List, Optional

from command_helpers import prepare_command

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_COMPOSE_FILE = REPO_ROOT / "infra" / "docker" / "docker-compose.yml"
DEFAULT_PROJECT_NAME = "fusion_futures"
VENV_DIR = REPO_ROOT / ".venv"
PYTHON_PACKAGE = "services/api[dev]"
GENERATE_TYPES_COMMAND = ["node", "scripts/generate-types.mjs"]


class SetupError(RuntimeError):
    """Raised when a non-recoverable setup error occurs."""


def configure_logging(verbose: bool) -> None:
    """Configure the root logger for human-friendly output."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)-8s | %(message)s",
        datefmt="%H:%M:%S",
    )


_prepare_command = prepare_command


def run_command(command: List[str], description: str, check: bool = True) -> None:
    """
    Execute a subprocess while streaming output to stdout for transparency.

    Args:
        command: Full command to execute.
        description: Human readable description logged before execution.
        check: If True, raise SetupError on non-zero exit codes.
    """
    logging.info("▶️ %s", description)
    prepared_command = _prepare_command(command)
    logging.debug("Executing command: %s", prepared_command)
    process = subprocess.Popen(prepared_command, cwd=REPO_ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    assert process.stdout is not None  # for type checkers
    for line in process.stdout:
        sys.stdout.write(line)
    process.wait()
    if process.returncode != 0:
        message = f"Command {' '.join(command)} failed with exit code {process.returncode}"
        logging.error("❌ %s", message)
        if check:
            raise SetupError(message)
    else:
        logging.info("✅ %s completed", description)


def check_prerequisites(skip_docker: bool) -> None:
    """
    Ensure core tooling is available before continuing, optionally bypassing Docker checks.

    Args:
        skip_docker: When True, Docker tooling validation is skipped so the script can
            prepare dependencies on hosts without Docker (e.g., CI runners).
    """
    required_tools = {
        "node": "Install Node.js 18+ from https://nodejs.org/ or via your package manager.",
        "pnpm": "Install pnpm from https://pnpm.io/installation or via `npm install -g pnpm@latest`.",
    }
    if not skip_docker:
        required_tools["docker"] = "Install Docker Desktop (Windows/macOS) or Docker Engine (Linux/Raspberry Pi)."

    missing: List[str] = []
    for tool, hint in required_tools.items():
        if shutil.which(tool) is None:
            logging.error("Required tool '%s' not found. Hint: %s", tool, hint)
            missing.append(tool)
        else:
            logging.debug("Found %s at %s", tool, shutil.which(tool))

    # Docker Compose might be v2 (docker compose) or the legacy binary docker-compose.
    if not skip_docker:
        if shutil.which("docker") is None:
            missing.append("docker")
        else:
            compose_supported = _docker_compose_available()
            if not compose_supported:
                logging.error(
                    "Docker Compose v2 not detected. Install Docker Desktop >= 4.24 or the standalone docker-compose plugin."
                )
                missing.append("docker compose")
    else:
        logging.debug("Docker checks skipped by user request (non-container environment assumed).")

    if sys.version_info < (3, 11):
        raise SetupError(
            "Python 3.11 or newer is required. Current interpreter reports version "
            f"{platform.python_version()}"
        )

    if missing:
        raise SetupError(
            "Prerequisite tooling missing: " + ", ".join(sorted(set(missing))) + ". Install the listed tools and rerun."
        )


def _docker_compose_available() -> bool:
    """Return True if `docker compose` is available."""
    try:
        result = subprocess.run(["docker", "compose", "version"], capture_output=True, text=True, check=False)
    except OSError:
        return False
    return result.returncode == 0


def ensure_pnpm_dependencies() -> None:
    """Install Node.js workspace dependencies via pnpm."""
    run_command(["pnpm", "install"], "Installing pnpm workspace dependencies")


def generate_types(skip_on_failure: bool) -> None:
    """Generate TypeScript definitions from the FastAPI schema."""
    try:
        run_command(GENERATE_TYPES_COMMAND, "Generating shared API TypeScript definitions")
    except SetupError:
        if skip_on_failure:
            logging.warning(
                "Type generation failed but execution will continue. Run `%s` manually after resolving the issue.",
                " ".join(GENERATE_TYPES_COMMAND),
            )
        else:
            raise


def ensure_virtualenv(python_executable: str) -> Path:
    """Create or reuse a virtual environment and return the interpreter path."""
    if not VENV_DIR.exists():
        logging.info("Creating virtual environment at %s", VENV_DIR)
        run_command([python_executable, "-m", "venv", str(VENV_DIR)], "Provisioning Python virtual environment")
    else:
        logging.info("Reusing existing virtual environment at %s", VENV_DIR)

    if platform.system().lower().startswith("win"):
        python_path = VENV_DIR / "Scripts" / "python.exe"
    else:
        python_path = VENV_DIR / "bin" / "python"

    if not python_path.exists():
        raise SetupError(
            f"Expected virtualenv interpreter not found at {python_path}. Delete {VENV_DIR} and rerun the setup script."
        )

    logging.debug("Virtual environment python located at %s", python_path)
    return python_path


def install_python_dependencies(venv_python: Path, extra_packages: Optional[Iterable[str]] = None) -> None:
    """Install backend dependencies inside the virtual environment."""
    packages = [PYTHON_PACKAGE]
    if extra_packages:
        packages.extend(list(extra_packages))

    command = [str(venv_python), "-m", "pip", "install", "--upgrade", "pip"]
    run_command(command, "Upgrading pip inside the virtual environment", check=False)

    run_command([str(venv_python), "-m", "pip", "install", "-e", packages[0]], "Installing Fusion Futures API dependencies")
    if len(packages) > 1:
        run_command([str(venv_python), "-m", "pip", "install", *packages[1:]], "Installing additional Python dependencies")


def launch_docker_stack(compose_file: Path, project_name: str, skip_build: bool) -> None:
    """Start the Docker Compose stack in detached mode."""
    command: List[str] = [
        "docker",
        "compose",
        "-f",
        str(compose_file),
        "--project-name",
        project_name,
        "up",
    ]
    if not skip_build:
        command.append("--build")
    command.append("-d")
    run_command(command, "Starting Docker services")


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    """Parse command-line arguments for the setup utility."""
    parser = argparse.ArgumentParser(
        description="Bootstrap Fusion Futures dependencies and launch Docker services without relying on GNU Make.",
    )
    parser.add_argument(
        "--python",
        default=sys.executable,
        help="Path to the Python interpreter used for creating the virtual environment (default: current interpreter).",
    )
    parser.add_argument(
        "--compose-file",
        default=str(DEFAULT_COMPOSE_FILE),
        help="Path to the docker-compose YAML file (default: infra/docker/docker-compose.yml).",
    )
    parser.add_argument(
        "--project-name",
        default=DEFAULT_PROJECT_NAME,
        help="Docker Compose project name (default: fusion_futures).",
    )
    parser.add_argument(
        "--skip-docker",
        action="store_true",
        help="Skip starting Docker containers (useful for CI or manual control).",
    )
    parser.add_argument(
        "--skip-install",
        action="store_true",
        help="Skip dependency installation steps and only launch Docker services.",
    )
    parser.add_argument(
        "--skip-types",
        action="store_true",
        help="Skip generating TypeScript definitions (run manually via `node scripts/generate-types.mjs`).",
    )
    parser.add_argument(
        "--allow-type-failures",
        action="store_true",
        help="Do not abort the setup if type generation fails (useful when the API is offline).",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug-level logging output.",
    )
    parser.add_argument(
        "--extra-python-package",
        action="append",
        dest="extra_python_packages",
        help="Additional Python packages to install inside the virtualenv (can be passed multiple times).",
    )
    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    configure_logging(args.verbose)

    logging.info("Fusion Futures setup starting (platform: %s)", platform.platform())
    logging.info("Repository root: %s", REPO_ROOT)

    try:
        check_prerequisites(skip_docker=args.skip_docker)

        if not args.skip_install:
            ensure_pnpm_dependencies()
            venv_python = ensure_virtualenv(args.python)
            install_python_dependencies(venv_python, args.extra_python_packages)
            if not args.skip_types:
                generate_types(skip_on_failure=args.allow_type_failures)
            else:
                logging.info("Type generation skipped as requested.")
        else:
            logging.info("Dependency installation skipped as requested.")

        compose_file = Path(args.compose_file).resolve()
        if not compose_file.exists():
            raise SetupError(f"Docker compose file not found at {compose_file}")

        if args.skip_docker:
            logging.info("Docker launch skipped. You can start manually with: docker compose -f %s --project-name %s up -d", compose_file, args.project_name)
        else:
            launch_docker_stack(compose_file, args.project_name, skip_build=False)

        logging.info("Setup complete. Web UI available at http://localhost:3100 and API at http://localhost:8000.")
        logging.info("Tail logs anytime with: docker compose -f %s --project-name %s logs -f --tail=200", compose_file, args.project_name)
        return 0
    except SetupError as error:
        logging.error("Setup aborted: %s", error)
        return 1
    except subprocess.CalledProcessError as error:
        logging.error("Command execution failed: %s", error)
        return error.returncode
    except KeyboardInterrupt:
        logging.warning("Setup interrupted by user.")
        return 130


if __name__ == "__main__":
    sys.exit(main())
