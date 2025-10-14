/**
 * @file layout.tsx
 * @description Mini README: Defines the root layout for the Fusion Futures platform, wiring in global providers,
 * navigation chrome, and shared metadata. The layout wraps every page with the header, sidebar, and global styles.
 * Structure: metadata export, RootLayout component returning html/body, Providers component, and shared layout chrome.
 */

import '../styles/globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { Providers } from './providers';
import { NavigationChrome } from '@/components/navigation-chrome';
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
        <Providers>
          <NavigationChrome>{children}</NavigationChrome>
        </Providers>
      </body>
    </html>
  );
}
