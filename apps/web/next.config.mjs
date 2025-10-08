/**
 * ============================================================================
 * File: apps/web/next.config.mjs
 * Purpose: Configure Next.js runtime behavior including experimental flags.
 * Structure: Exports a typed configuration object consumed by Next.
 * Usage: Automatically read by Next.js during build and dev commands.
 * ============================================================================
 */
import { createSecureHeaders } from "next-secure-headers";

const securityHeaders = createSecureHeaders({
  forceHTTPSRedirect: [true, { maxAge: 63072000, includeSubDomains: true }],
  referrerPolicy: "no-referrer",
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],
};

export default nextConfig;
