"use client";
/**
 * ============================================================================
 * File: apps/web/components/query-provider.tsx
 * Purpose: Wrap children with TanStack Query client for data fetching.
 * Structure: Maintains a singleton QueryClient instance with hydration support.
 * Usage: Consumed by root layout provider composition.
 * ============================================================================
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
