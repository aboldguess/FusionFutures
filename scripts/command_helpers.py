#!/usr/bin/env python3
"""
===============================================================================
File: scripts/command_helpers.py
Purpose: Share reusable command execution helpers that transparently resolve
         platform-specific launchers for CLI tooling used across repository
         automation scripts.
Structure: Exposes `prepare_command`, a utility that normalises command lists,
           resolves absolute executable paths, and inserts Windows PowerShell
           shims when required so callers can safely spawn subprocesses.
Usage: Import `prepare_command` from other scripts before invoking
       `subprocess` APIs to guarantee consistent command resolution on Linux,
       macOS, Windows, and Raspberry Pi environments.
===============================================================================
"""
from __future__ import annotations

import platform
import shutil
from typing import Iterable, List


def prepare_command(command: Iterable[str]) -> List[str]:
    """Resolve executables and wrap PowerShell scripts so subprocesses succeed."""

    command_list = list(command)
    if not command_list:
        raise ValueError("Command list cannot be empty.")

    executable = command_list[0]
    resolved = shutil.which(executable)

    if resolved is None:
        return command_list

    if platform.system().lower().startswith("win") and resolved.lower().endswith(".ps1"):
        return [
            "powershell.exe",
            "-NoLogo",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            resolved,
            *command_list[1:],
        ]

    return [resolved, *command_list[1:]]
