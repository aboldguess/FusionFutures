/**
 * @file layout.tsx
 * @description Mini README: Defines the root layout for the Fusion Futures platform, wiring in global providers and
 * shared metadata. The authenticated navigation chrome now lives inside the (app) route group so public auth pages stay
 * lightweight.
 */

import '../styles/globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from './providers';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Fusion Futures Hub',
  description:
    'Fusion Futures Hub – a collaborative digital platform for fusion energy employers, learners, and educators.',
  metadataBase: new URL('https://fusionfutures.local')
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-slate-950 text-slate-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
