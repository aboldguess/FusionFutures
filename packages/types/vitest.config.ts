/**
 * ============================================================================
 * File: packages/types/vitest.config.ts
 * Purpose: Configure Vitest for the shared type package.
 * Structure: Minimal config using Node environment.
 * Usage: Loaded by `pnpm --filter @fusion-futures/types test`.
 * ============================================================================
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});
