/**
 * @file profile-menu.tsx
 * @description Mini README: Implements the top-right profile button with mandated submenu options. The menu highlights
 * the currently active user and offers call-to-action buttons for the core platform areas. Sign-out integrates with the
 * auth provider to clear sessions securely.
 */

'use client';

import { Menu } from '@headlessui/react';
import Image from 'next/image';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import { usePlatformUser } from '@/hooks/use-platform-user';
import { logger } from '@/lib/logger';

interface MenuEntry {
  label: string;
  action: () => void;
}

export function ProfileMenu() {
  const { activeUser, logout } = usePlatformUser();
  const router = useRouter();

  if (!activeUser) {
    return null;
  }

  const entries: MenuEntry[] = [
    {
      label: 'Manage Profiles',
      action: () => logger.info('Manage Profiles clicked')
    },
    {
      label: 'Learning Zone',
      action: () => logger.info('Learning Zone clicked')
    },
    {
      label: 'My Details',
      action: () => logger.info('My Details clicked')
    },
    {
      label: 'Subscription Details',
      action: () => logger.info('Subscription Details clicked')
    },
    {
      label: 'Manage Users',
      action: () => router.push('/admin')
    },
    {
      label: 'Sign out',
      action: () => {
        logout();
        router.push('/login');
      }
    }
  ];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left text-sm font-semibold text-white shadow-soft transition hover:bg-white/10">
        <Image
          src={activeUser.profile.avatar}
          alt={`${activeUser.profile.name} avatar`}
          width={36}
          height={36}
          className="h-9 w-9 rounded-full object-cover"
        />
        <div className="hidden text-left md:block">
          <p>{activeUser.profile.name}</p>
          <p className="text-xs text-slate-300">{activeUser.profile.title}</p>
        </div>
        <ChevronDownIcon className="h-4 w-4 text-slate-200" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right divide-y divide-white/5 rounded-2xl border border-white/10 bg-slate-900/95 p-2 text-sm text-slate-100 shadow-2xl backdrop-blur">
        {entries.map((item) => (
          <Menu.Item key={item.label} as={Fragment}>
            {({ active }) => (
              <button
                type="button"
                className={clsx(
                  'w-full rounded-xl px-4 py-2 text-left transition',
                  active ? 'bg-brand/20 text-white' : 'text-slate-200 hover:bg-white/5'
                )}
                onClick={() => {
                  item.action();
                  logger.info('Profile menu interaction', { item: item.label, user: activeUser.email });
                }}
              >
                {item.label}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}
