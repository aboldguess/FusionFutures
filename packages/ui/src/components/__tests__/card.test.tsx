/**
 * ============================================================================
 * File: packages/ui/src/components/__tests__/card.test.tsx
 * Purpose: Validate the Card component renders headings and actions correctly.
 * Structure: Uses React Testing Library with Vitest for component testing.
 * Usage: Executed via `npm run test --workspace @fusion-futures/ui`.
 * ============================================================================
 */
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "../card";

describe("Card", () => {
  it("renders title and subtitle", () => {
    render(<Card title="Test Card" subtitle="Helpful context" />);
    expect(screen.getByText("Test Card")).toBeInTheDocument();
    expect(screen.getByText("Helpful context")).toBeInTheDocument();
  });
});
