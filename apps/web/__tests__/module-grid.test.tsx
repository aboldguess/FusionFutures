/**
 * ============================================================================
 * File: apps/web/__tests__/module-grid.test.tsx
 * Purpose: Ensure ModuleGrid renders module registry entries.
 * Structure: Renders component and asserts accessible labels.
 * Usage: Run via Vitest test command.
 * ============================================================================
 */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ModuleGrid } from "@fusion-futures/ui";

describe("ModuleGrid", () => {
  it("lists modules from registry", () => {
    render(<ModuleGrid />);
    expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
  });
});
