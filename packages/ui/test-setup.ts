/**
 * ============================================================================
 * File: packages/ui/test-setup.ts
 * Purpose: Provide stubs for Next.js modules within UI library tests.
 * Structure: Defines lightweight mocks for next/link and next/navigation usage.
 * Usage: Loaded by Vitest configuration.
 * ============================================================================
 */
import "@testing-library/jest-dom/vitest";
import { createElement, type ReactNode } from "react";
import { vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null }),
  signOut: () => Promise.resolve(),
}));
