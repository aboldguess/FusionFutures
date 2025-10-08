/**
 * ============================================================================
 * File: apps/web/lib/use-debug-logging.ts
 * Purpose: Provide a React hook that emits structured debug logs with request correlation.
 * Structure: Exposes a function accepting an event name and payload, attaching window-level request IDs.
 * Usage: Imported across the web app to encourage consistent debugging patterns.
 * ============================================================================
 */
import { useEffect } from "react";
import { nanoid } from "nanoid";

const globalRequestId = typeof window !== "undefined" ? window.crypto.randomUUID?.() ?? nanoid() : nanoid();

export const useDebugLogging = (eventName: string, payload: Record<string, unknown>) => {
  useEffect(() => {
    const enriched = {
      event: eventName,
      payload,
      correlationId: globalRequestId,
      timestamp: new Date().toISOString(),
    };
    console.debug("[fusion-futures]", enriched);
  }, [eventName, payload]);
};

export const getCorrelationId = () => globalRequestId;
