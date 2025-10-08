/**
 * ============================================================================
 * File: packages/types/tests/openapi-types.test.ts
 * Purpose: Ensure placeholder OpenAPI types remain structurally sound.
 * Structure: Vitest test verifying exported shape from generated types.
 * Usage: Executed via workspace test commands.
 * ============================================================================
 */
import { describe, expect, it } from "vitest";
import type { DemoDataResponse } from "../src/openapi-types";

describe("DemoDataResponse", () => {
  it("matches expected structure", () => {
    const sample: DemoDataResponse = { items: [{ id: "1", title: "Example", metric: "42" }] };
    expect(sample.items[0].metric).toBe("42");
  });
});
