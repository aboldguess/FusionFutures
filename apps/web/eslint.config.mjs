/**
 * @file eslint.config.mjs
 * @description Mini README: ESLint flat config for the Fusion Futures web app. Reuses Next.js' core web vitals
 *   and TypeScript presets while enabling project-aware type checking.
 *
 * Structure
 * ---------
 * - Uses FlatCompat to reuse the legacy `next/*` shareable configs.
 * - Applies the config to all JS/TS files while ignoring generated output.
 * - Enables project-aware TypeScript rules via `parserOptions.project`.
 */

import path from 'node:path';
import url from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const modulePath = url.fileURLToPath(import.meta.url);
const baseDirectory = path.dirname(modulePath);
const compat = new FlatCompat({ baseDirectory });

const config = [
  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: baseDirectory,
      },
    },
  },
  {
    files: ['next-env.d.ts'],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off'
    }
  },
  {
    files: ['**/*.config.{js,cjs,mjs,ts}'],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },
  {
    files: ['src/lib/logger.ts'],
    rules: {
      'no-console': 'off'
    }
  }
];

export default config;
