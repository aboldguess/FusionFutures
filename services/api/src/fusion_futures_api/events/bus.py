"""
============================================================================
File: services/api/src/fusion_futures_api/events/bus.py
Purpose: Provide a simple in-memory pub/sub event bus with async handlers.
Structure: Maintains topic subscriptions and exposes publish/subscribe helpers.
Usage: Modules publish domain events to decouple workflows.
============================================================================
"""
from __future__ import annotations

import asyncio
from collections import defaultdict
from typing import Awaitable, Callable, DefaultDict, List

EventHandler = Callable[[dict], Awaitable[None]]

class EventBus:
    """In-memory pub/sub event bus with async handlers."""

    def __init__(self) -> None:
        self._subscriptions: DefaultDict[str, List[EventHandler]] = defaultdict(list)
        self._loop = asyncio.get_event_loop()

    def subscribe(self, topic: str, handler: EventHandler) -> None:
        self._subscriptions[topic].append(handler)

    def publish(self, topic: str, payload: dict) -> None:
        for handler in self._subscriptions.get(topic, []):
            self._loop.create_task(handler(payload))
