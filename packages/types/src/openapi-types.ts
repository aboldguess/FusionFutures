/**
 * ============================================================================
 * File: packages/types/src/openapi-types.ts
 * Purpose: Placeholder for generated OpenAPI TypeScript definitions.
 * Structure: Contains manual seed definitions plus re-export for generated file when present.
 * Usage: Overwritten/augmented by `node scripts/generate-types.mjs`, `npm run types`, or the automated setup script.
 * ============================================================================
 */
export type DemoDataItem = {
  id: string;
  title: string;
  metric: string;
};

export type DemoDataResponse = {
  items: DemoDataItem[];
};
