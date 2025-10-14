/**
 * @file admin-user-table.tsx
 * @description Mini README: Simulates the admin console for managing platform users with search, filters, and action
 * buttons. Provides quick-glance permissions and status badges.
 */

'use client';

import { users } from '@/data/users';
import type { PlatformUser } from '@/types/platform';
import { useMemo, useState } from 'react';
import { clsx } from 'clsx';

const statusPalette = {
  active: 'bg-emerald-500/20 text-emerald-200',
  pending: 'bg-amber-500/20 text-amber-200'
};

type Status = keyof typeof statusPalette;
type UserWithStatus = PlatformUser & { status: Status };

export function AdminUserTable() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');

  const rows = useMemo<UserWithStatus[]>(() => {
    return users
      .map((user, index) => ({
        ...user,
        status: (index % 3 === 0 ? 'pending' : 'active') as Status
      }))
      .filter((user) =>
        user.profile.name.toLowerCase().includes(search.toLowerCase()) ||
        user.profile.title.toLowerCase().includes(search.toLowerCase())
      )
      .filter((user) => (statusFilter === 'all' ? true : user.status === statusFilter));
  }, [search, statusFilter]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">User governance</p>
          <p className="text-xs text-slate-300">Search, filter, and take action without leaving this panel.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-xs text-white focus:border-brand focus:outline-none"
            placeholder="Search people"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as Status | 'all')}
            className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-xs text-white focus:border-brand focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/5">
        <table className="min-w-full divide-y divide-white/5 text-left text-sm text-slate-200">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-4 py-3">Person</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Organisation</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-4">
                  <div className="font-semibold text-white">{user.profile.name}</div>
                  <div className="text-xs text-slate-300">{user.profile.title}</div>
                </td>
                <td className="px-4 py-4 capitalize">{user.role}</td>
                <td className="px-4 py-4">{user.organisation?.name ?? 'Independent'}</td>
                <td className="px-4 py-4">
                  <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', statusPalette[user.status])}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2 text-xs">
                    <button className="rounded-full bg-white/10 px-3 py-1 hover:bg-brand/40" type="button">
                      Message
                    </button>
                    <button className="rounded-full bg-white/10 px-3 py-1 hover:bg-brand/40" type="button">
                      Update role
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
