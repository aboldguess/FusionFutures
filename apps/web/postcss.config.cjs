/**
 * ============================================================================
 * File: apps/web/postcss.config.cjs
 * Purpose: Configure PostCSS pipeline for Tailwind integration.
 * Structure: Exports plugin array executed during build.
 * Usage: Automatically invoked by Next.js when processing styles.
 * ============================================================================
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
