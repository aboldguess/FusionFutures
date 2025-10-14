/**
 * @file user-role-selector.tsx
 * @description Mini README: Dropdown for switching between platform roles. Useful for demos and QA to check permissions.
 * Integrates with the usePlatformUser hook to update context and triggers debug logging for traceability.
 */

'use client';

import { ChangeEvent } from 'react';
import type { UserRole } from '@/types/platform';
import { usePlatformUser } from '@/hooks/use-platform-user';

export function UserRoleSelector() {
  const { switchRole, availableUsers, activeUser, canImpersonate } = usePlatformUser();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = event.target.value as UserRole;

    if (!selectedRole) {
      return;
    }

    switchRole(selectedRole);
  };

  return (
    <label className="text-xs text-slate-300">
      Quick role switcher
      <select
        value={activeUser?.role ?? 'user'}
        onChange={handleChange}
        disabled={!canImpersonate}
        className="ml-2 rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-sm text-white shadow-soft focus:border-brand focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {availableUsers.map((user) => (
          <option key={user.id} value={user.role} className="bg-slate-900">
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </option>
        ))}
      </select>
      {!canImpersonate && (
        <span className="ml-2 text-[10px] uppercase text-slate-500">Superadmin only</span>
      )}
    </label>
  );
}
