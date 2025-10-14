/**
 * @file logger.ts
 * @description Mini README: Provides a lightweight, browser-safe logging utility that timestamps messages and respects the
 * DEBUG environment flag. Intended to aid debugging without leaking sensitive data.
 * Structure: severity type, guard to honour env, helper for formatting, exported logger object.
 */

import {
  getDefaultDebugFlag,
  parsePublicBoolean,
  RUNTIME_DEBUG_STORAGE_KEY
} from '@/lib/runtime-config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_PREFIX = '[FusionFutures]';
// Capture the default debug preference at module load so both server and client honour the same baseline behaviour.
const DEFAULT_DEBUG_FLAG = getDefaultDebugFlag();

const isDebugEnabled = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_DEBUG_FLAG;
  }

  try {
    // Developers can toggle the flag in DevTools; respect that manual override if it exists.
    const storedValue = localStorage.getItem(RUNTIME_DEBUG_STORAGE_KEY);

    if (storedValue === null) {
      // Seed the storage value so developers can discover and override the setting easily.
      localStorage.setItem(RUNTIME_DEBUG_STORAGE_KEY, DEFAULT_DEBUG_FLAG ? 'true' : 'false');
      return DEFAULT_DEBUG_FLAG;
    }

    const parsedStoredValue = parsePublicBoolean(storedValue);

    if (parsedStoredValue === undefined) {
      // Normalise any unexpected values back to the default for predictable behaviour.
      localStorage.setItem(RUNTIME_DEBUG_STORAGE_KEY, DEFAULT_DEBUG_FLAG ? 'true' : 'false');
      return DEFAULT_DEBUG_FLAG;
    }

    return parsedStoredValue;
  } catch (error) {
    console.warn(`${LOG_PREFIX} Unable to read ${RUNTIME_DEBUG_STORAGE_KEY} flag from localStorage`, error);
    return DEFAULT_DEBUG_FLAG;
  }
};

function emit(level: LogLevel, message: string, payload?: Record<string, unknown>) {
  if (!isDebugEnabled() && level === 'debug') {
    return;
  }

  const timestamp = new Date().toISOString();
  console[level](`${LOG_PREFIX} ${timestamp} ${level.toUpperCase()}: ${message}`, payload ?? '');
}

export const logger = {
  debug: (message: string, payload?: Record<string, unknown>) => emit('debug', message, payload),
  info: (message: string, payload?: Record<string, unknown>) => emit('info', message, payload),
  warn: (message: string, payload?: Record<string, unknown>) => emit('warn', message, payload),
  error: (message: string, payload?: Record<string, unknown>) => emit('error', message, payload),
  /**
   * Allows explicit enabling or disabling of verbose logging at runtime. Stored in localStorage for persistence.
   */
  setDebugOverride: (enabled: boolean) => {
    if (typeof window === 'undefined') {
      console.warn(`${LOG_PREFIX} Debug override is only available in browser environments.`);
      return;
    }

    try {
      localStorage.setItem(RUNTIME_DEBUG_STORAGE_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      console.error(`${LOG_PREFIX} Unable to persist debug override`, error);
    }
  }
};
