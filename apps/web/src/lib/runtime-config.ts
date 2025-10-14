/**
 * @file runtime-config.ts
 * @description Mini README: Centralised helper for reading environment-driven runtime configuration that is safe to
 * consume on both the server and browser. It parses public environment variables, provides defensive fallbacks, and
 * exposes the derived values for other modules such as logging and navigation chrome.
 * Structure: utility parsers, constant fallbacks, exported runtime configuration object and helper functions.
 */

// Normalise truthy/falsey strings in a case-insensitive manner for flexible configuration inputs.
const TRUE_FLAG_VALUES = new Set(['1', 'true', 'yes', 'on']);
const FALSE_FLAG_VALUES = new Set(['0', 'false', 'no', 'off']);

export const RUNTIME_DEBUG_STORAGE_KEY = 'ff-debug';

/**
 * Parses a textual flag into a boolean where possible. Returns undefined if the value could not be interpreted,
 * allowing the caller to supply a sensible fallback.
 */
export function parsePublicBoolean(value: string | null | undefined): boolean | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalisedValue = value.trim().toLowerCase();

  if (TRUE_FLAG_VALUES.has(normalisedValue)) {
    return true;
  }

  if (FALSE_FLAG_VALUES.has(normalisedValue)) {
    return false;
  }

  return undefined;
}

const APP_NAME_FALLBACK = 'Fusion Futures Hub';

const appNameFromEnv = (process.env.NEXT_PUBLIC_APP_NAME ?? APP_NAME_FALLBACK).trim();

const debugFlagFromEnv = parsePublicBoolean(process.env.NEXT_PUBLIC_FF_DEBUG);
const debugFallback = process.env.NODE_ENV !== 'production';

export const runtimeConfig = {
  appName: appNameFromEnv.length > 0 ? appNameFromEnv : APP_NAME_FALLBACK,
  defaultDebugEnabled: debugFlagFromEnv ?? debugFallback
};

/**
 * Retrieves the configured application name, guaranteeing a non-empty string to simplify consumer code.
 */
export function getAppName(): string {
  return runtimeConfig.appName;
}

/**
 * Exposes the default debug flag derived from the environment, aiding modules that need to respect verbosity
 * preferences without directly coupling to process.env.
 */
export function getDefaultDebugFlag(): boolean {
  return runtimeConfig.defaultDebugEnabled;
}
