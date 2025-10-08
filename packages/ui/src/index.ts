/**
 * ============================================================================
 * File: packages/ui/src/index.ts
 * Purpose: Barrel exporting the shared UI primitives and module registry utilities.
 * Structure: Re-exports components, hooks, and configuration for consumers.
 * Usage: Imported by apps/web and future packages for consistent UI patterns.
 * ============================================================================
 */
export { NavigationShell } from "./navigation-shell";
export { Card } from "./components/card";
export { HealthBadge } from "./components/health-badge";
export { DebugConsoleHint } from "./components/debug-console-hint";
export { ModuleGrid, ModuleSummary, moduleRegistry } from "./module-registry";
