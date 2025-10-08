/**
 * ============================================================================
 * File: apps/web/vitest.setup.ts
 * Purpose: Register testing utilities and global mocks for the Next.js app.
 * Structure: Imports jest-dom matchers and polyfills fetch with node-fetch.
 * Usage: Referenced in Vitest configuration.
 * ============================================================================
 */
import "@testing-library/jest-dom/vitest";
import { fetch, Request, Response, Headers } from "cross-fetch";
import { vi } from "vitest";
import { createElement, type ReactNode } from "react";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Request = Request as unknown as typeof globalThis.Request;
  globalThis.Response = Response as unknown as typeof globalThis.Response;
  globalThis.Headers = Headers as unknown as typeof globalThis.Headers;
}
