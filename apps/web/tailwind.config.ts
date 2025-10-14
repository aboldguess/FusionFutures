/**
 * @file tailwind.config.ts
 * @description Mini README: TailwindCSS configuration defining the design tokens used across the Fusion Futures platform,
 * including an accessible colour palette and plugin configuration for typography.
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1f5eff',
          dark: '#1638b7',
          light: '#b3c7ff'
        },
        slate: {
          950: '#0f172a'
        }
      },
      boxShadow: {
        soft: '0 20px 40px -20px rgba(15, 23, 42, 0.3)'
      }
    }
  },
  plugins: []
};

export default config;
