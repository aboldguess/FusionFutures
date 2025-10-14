/**
 * @file admin-user-table.tsx
 * @description Mini README: Governance table showing live platform accounts with search, filters, and quick actions. Pulls
 * state from the auth provider so admins can audit new invitation redemptions instantly.
 */

'use client';

import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { usePlatformUser } from '@/hooks/use-platform-user';

const statusPalette = {
  active: 'bg-emerald-500/20 text-emerald-200',
  invited: 'bg-amber-500/20 text-amber-200',
  suspended: 'bg-rose-500/20 text-rose-200'
};

type StatusFilter = keyof typeof statusPalette | 'all';

export function AdminUserTable() {
  const { accounts } = usePlatformUser();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const rows = useMemo(() => {
    const term = search.toLowerCase();

    return accounts
      .filter((account) =>
        term
          ? account.profile.name.toLowerCase().includes(term) ||
            account.profile.title.toLowerCase().includes(term) ||
            account.email.toLowerCase().includes(term)
          : true
      )
      .filter((account) => (statusFilter === 'all' ? true : account.status === statusFilter));
  }, [accounts, search, statusFilter]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">User governance</p>
          <p className="text-xs text-slate-300">
            Search, filter, and take action without leaving this panel. New sign-ups appear immediately.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-xs text-white focus:border-brand focus:outline-none"
            placeholder="Search name, title, or email"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-xs text-white focus:border-brand focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="suspended">Suspended</option>
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
              <th className="px-4 py-3">Last login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((account) => (
              <tr key={account.id}>
                <td className="px-4 py-4">
                  <div className="font-semibold text-white">{account.profile.name}</div>
                  <div className="text-xs text-slate-300">{account.profile.title}</div>
                  <div className="text-xs text-slate-400">{account.email}</div>
                </td>
                <td className="px-4 py-4 capitalize">{account.role}</td>
                <td className="px-4 py-4">{account.organisation?.name ?? 'Independent'}</td>
                <td className="px-4 py-4">
                  <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', statusPalette[account.status])}>
                    {account.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-slate-300">
                  {account.lastLogin ? new Date(account.lastLogin).toLocaleString() : 'Never'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
