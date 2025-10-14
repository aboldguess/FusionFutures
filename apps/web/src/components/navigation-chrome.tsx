/**
 * @file navigation-chrome.tsx
 * @description Mini README: Houses the global navigation shell including the responsive sidebar and top navigation bar.
 * It receives page content as children and lays out the application skeleton. The navigation highlights the active route
 * and contains the mandated profile menu with admin shortcuts.
 */

'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { ReactNode, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { ProfileMenu } from '@/components/profile-menu';
import { RoleBadge } from '@/components/role-badge';
import { UserRoleSelector } from '@/components/user-role-selector';
import { logger } from '@/lib/logger';
import { usePlatformUser } from '@/hooks/use-platform-user';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface NavigationChromeProps {
  children: ReactNode;
}

interface NavigationLink {
  href: Route;
  label: string;
}

const links: NavigationLink[] = [
  { href: '/', label: 'Impact Feed' },
  { href: '/events', label: 'Events Hub' },
  { href: '/employers', label: 'Employers & Educators' },
  { href: '/admin', label: 'Admin Control' }
];

export function NavigationChrome({ children }: NavigationChromeProps) {
  const pathname = usePathname();
  const { activeUser } = usePlatformUser();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const sidebarLinks = useMemo(
    () =>
      links.map((link) => ({
        ...link,
        isActive: pathname === link.href
      })),
    [pathname]
  );

  logger.debug('Rendering NavigationChrome', { activePath: pathname, sidebarOpen: isSidebarOpen });

  return (
    <div className="flex min-h-screen">
      <aside
        className={clsx(
          'hidden w-72 flex-col justify-between border-r border-white/10 bg-slate-900 p-6 transition-all md:flex',
          {
            'w-24': !isSidebarOpen
          }
        )}
      >
        <div>
          <button
            type="button"
            onClick={() => setSidebarOpen((previous) => !previous)}
            className="mb-8 flex items-center gap-3 rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/20"
          >
            <SparklesIcon className="h-5 w-5" />
            <span>{isSidebarOpen ? 'Toggle compact nav' : 'Expand navigation'}</span>
          </button>
          <nav className="space-y-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
                  link.isActive
                    ? 'bg-brand text-white shadow-soft'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                )}
              >
                <span className="flex-1">{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="space-y-3 text-xs text-slate-400">
          <p>Need help? The platform tour is inside each page header.</p>
          <p className="font-semibold text-brand-light">Fusion Futures v1.0</p>
        </div>
      </aside>
      <main className="flex-1 bg-slate-950">
        <header className="sticky top-0 z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Fusion Futures Hub</h1>
              <p className="text-sm text-slate-300">
                Welcome {activeUser.profile.name}. Follow the on-screen prompts to manage your network, content, and events
                without needing the documentation.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <RoleBadge role={activeUser.role} />
              <UserRoleSelector />
              <ProfileMenu />
            </div>
          </div>
        </header>
        <section className="mx-auto max-w-6xl space-y-8 px-6 py-10">{children}</section>
      </main>
    </div>
  );
}
