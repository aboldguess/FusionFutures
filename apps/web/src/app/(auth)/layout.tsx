/**
 * @file (auth)/layout.tsx
 * @description Mini README: Layout for public authentication routes. Provides a centred panel with consistent branding
 * while keeping navigation minimal during login or invitation flows.
 */

import { ReactNode } from 'react';
import Link from 'next/link';
import { getAppName } from '@/lib/runtime-config';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const appName = getAppName();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <div className="w-full max-w-3xl space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl">
        <header className="text-center">
          <h1 className="text-2xl font-semibold text-white">{appName}</h1>
          <p className="mt-2 text-sm text-slate-300">
            Secure access for Fusion Futures administrators and collaborators. Follow the on-screen steps to continue.
          </p>
        </header>
        {children}
        <footer className="text-center text-xs text-slate-500">
          <p>
            Need an invitation? Contact your platform administrator or{' '}
            <Link href="/login" className="text-brand underline">
              return to the login portal
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
