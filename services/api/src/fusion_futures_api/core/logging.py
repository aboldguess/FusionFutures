"""
============================================================================
File: services/api/src/fusion_futures_api/core/logging.py
Purpose: Configure structured logging with correlation support.
Structure: Sets up python-json-logger handler and provides helper for request IDs.
Usage: Invoked at app startup and reused by modules for consistent logging.
============================================================================
"""
from __future__ import annotations

import logging
import sys
from typing import Any, Dict

from pythonjsonlogger import jsonlogger

CORRELATION_KEY = "x-request-id"

class CorrelationFormatter(jsonlogger.JsonFormatter):
    """Attach correlation ID to every log record if present."""

    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]) -> None:
        super().add_fields(log_record, record, message_dict)
        if not log_record.get("level"):
            log_record["level"] = record.levelname
        if correlation := getattr(record, CORRELATION_KEY, None):
            log_record[CORRELATION_KEY] = correlation

def configure_logging() -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(CorrelationFormatter("%(message)s"))
    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(logging.INFO)
