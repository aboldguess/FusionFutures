/**
 * ============================================================================
 * File: apps/web/tailwind.config.ts
 * Purpose: Tailwind CSS configuration enabling dark mode and custom themes.
 * Structure: Exports Tailwind configuration object consumed during build.
 * Usage: Tailwind CLI and Next.js PostCSS pipeline import this file automatically.
 * ============================================================================
 */
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F766E",
          foreground: "#ECFDF5",
        },
        secondary: {
          DEFAULT: "#2563EB",
          foreground: "#E0F2FE",
        },
      },
    },
  },
  plugins: [typography, forms],
};

export default config;
