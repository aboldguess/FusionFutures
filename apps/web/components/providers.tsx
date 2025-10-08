"use client";
/**
 * ============================================================================
 * File: apps/web/components/providers.tsx
 * Purpose: Compose client-side providers (Auth.js, Theme, Query) and navigation shell.
 * Structure: Wraps children with SessionProvider, ThemeProvider, QueryProvider, and NavigationShell.
 * Usage: Consumed by the root layout to keep server/client boundaries clean.
 * ============================================================================
 */
import { ReactNode, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { NavigationShell } from "@fusion-futures/ui";
import { QueryProvider } from "./query-provider";
import { useDebugLogging } from "../lib/use-debug-logging";

export const Providers = ({ children }: { children: ReactNode }) => {
  useDebugLogging("providers-mounted", { timestamp: new Date().toISOString() });

  useEffect(() => {
    console.info("Fusion Futures UI bootstrapped with secure defaults.");
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryProvider>
          <NavigationShell>{children}</NavigationShell>
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};
