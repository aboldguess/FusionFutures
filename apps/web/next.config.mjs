/**
 * @file next.config.mjs
 * @description Mini README: Configures the Next.js build for the Fusion Futures platform, enabling strict mode,
 * progressive Web App headers, and typed Tailwind CSS support. The configuration is intentionally minimal to keep
 * maintenance simple and secure.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ],
    unoptimized: true
  },
  eslint: {
    dirs: ['src']
  }
};

export default nextConfig;
