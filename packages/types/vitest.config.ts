/**
 * ============================================================================
 * File: packages/types/vitest.config.ts
 * Purpose: Configure Vitest for the shared type package.
 * Structure: Minimal config using Node environment.
 * Usage: Loaded by `npm run test --workspace @fusion-futures/types`.
 * ============================================================================
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});
