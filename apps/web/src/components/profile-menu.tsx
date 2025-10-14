/**
 * @file profile-menu.tsx
 * @description Mini README: Implements the top-right profile button with mandated submenu options. The menu highlights
 * the currently active user and offers call-to-action buttons for the core platform areas.
 */

'use client';

import { Menu } from '@headlessui/react';
import Image from 'next/image';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { clsx } from 'clsx';
import { usePlatformUser } from '@/hooks/use-platform-user';

const menuItems = [
  'Manage Profiles',
  'Learning Zone',
  'My Details',
  'Subscription Details',
  'Manage Users',
  'Sign out'
];

export function ProfileMenu() {
  const { activeUser } = usePlatformUser();

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
        {menuItems.map((item) => (
          <Menu.Item key={item} as={Fragment}>
            {({ active }) => (
              <button
                type="button"
                className={clsx(
                  'w-full rounded-xl px-4 py-2 text-left transition',
                  active ? 'bg-brand/20 text-white' : 'text-slate-200 hover:bg-white/5'
                )}
              >
                {item}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}
