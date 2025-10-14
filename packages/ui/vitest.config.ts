/**
 * ============================================================================
 * File: packages/ui/vitest.config.ts
 * Purpose: Configure Vitest with React Testing Library and jsdom environment.
 * Structure: Exports configuration used by package test command.
 * Usage: Automatically loaded when running `npm run test --workspace @fusion-futures/ui`.
 * ============================================================================
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test-setup.ts"],
  },
});
