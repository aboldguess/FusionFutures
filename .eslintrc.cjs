/**
 * ============================================================================
 * File: .eslintrc.cjs
 * Purpose: Shared ESLint configuration covering Next.js, React, and TypeScript.
 * Structure: Exports configuration object consumed by workspace packages.
 * Usage: Extended/overridden within package-level ESLint configs when needed.
 * ============================================================================
 */
module.exports = {
  root: true,
  parserOptions: {
    project: true,
  },
  env: {
    browser: true,
    node: true,
    es2023: true,
  },
  plugins: ["@typescript-eslint", "jsx-a11y", "security"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:security/recommended",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "security/detect-object-injection": "off"
  },
};
