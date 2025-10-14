/**
 * ============================================================================
 * File: apps/web/vitest.config.ts
 * Purpose: Configure Vitest for the Next.js application.
 * Structure: Uses Vite React plugin and jsdom environment to emulate browser.
 * Usage: Loaded when running `npm run test --workspace fusion-futures-web`.
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
