/**
 * ============================================================================
 * File: apps/web/app/layout.tsx
 * Purpose: Root layout wrapping all Next.js routes with providers and theming.
 * Structure: Defines metadata, dark-mode handling, Auth.js SessionProvider, and layout chrome.
 * Usage: Automatically invoked by Next.js for every page render.
 * ============================================================================
 */
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Providers } from "../components/providers";

export const metadata: Metadata = {
  title: "Fusion Futures Control Center",
  description: "Secure admin hub demonstrating modular Next.js patterns.",
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
