/**
 * ============================================================================
 * File: apps/web/vitest.config.ts
 * Purpose: Configure Vitest for the Next.js application.
 * Structure: Uses Vite React plugin and jsdom environment to emulate browser.
 * Usage: Loaded when running `pnpm --filter fusion-futures-web test`.
 * ============================================================================
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
