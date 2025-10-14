/**
 * @file logger.ts
 * @description Mini README: Provides a lightweight, browser-safe logging utility that timestamps messages and respects the
 * DEBUG environment flag. Intended to aid debugging without leaking sensitive data.
 * Structure: severity type, guard to honour env, helper for formatting, exported logger object.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_PREFIX = '[FusionFutures]';
const isDebugEnabled = () => {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV !== 'production';
  }

  try {
    return localStorage.getItem('ff-debug') === 'true';
  } catch (error) {
    // eslint-disable-next-line no-console -- Fallback logs only when localStorage is unavailable.
    console.warn(`${LOG_PREFIX} Unable to read ff-debug flag from localStorage`, error);
    return false;
  }
};

function emit(level: LogLevel, message: string, payload?: Record<string, unknown>) {
  if (!isDebugEnabled() && level === 'debug') {
    return;
  }

  const timestamp = new Date().toISOString();
  // eslint-disable-next-line no-console -- debugging utility intentionally exposes console output.
  console[level](`${LOG_PREFIX} ${timestamp} ${level.toUpperCase()}: ${message}`, payload ?? '');
}

export const logger = {
  debug: (message: string, payload?: Record<string, unknown>) => emit('debug', message, payload),
  info: (message: string, payload?: Record<string, unknown>) => emit('info', message, payload),
  warn: (message: string, payload?: Record<string, unknown>) => emit('warn', message, payload),
  error: (message: string, payload?: Record<string, unknown>) => emit('error', message, payload)
};
