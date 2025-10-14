/**
 * @file admin-organisation-queue.tsx
 * @description Mini README: Surfaces organisations awaiting approval and provides single-click moderation controls.
 * Relies on the auth provider so approvals instantly update across the platform.
 */

'use client';

import { useMemo } from 'react';
import { usePlatformUser } from '@/hooks/use-platform-user';

export function AdminOrganisationQueue() {
  const { organisations, accounts, approveOrganisation, activeUser } = usePlatformUser();

  const pendingOrganisations = useMemo(
    () => organisations.filter((organisation) => organisation.status === 'pending'),
    [organisations]
  );

  if (pendingOrganisations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-sm text-slate-300">
        No organisations need approval right now. New submissions will appear here immediately.
      </div>
    );
  }

  const canApprove = Boolean(activeUser && (activeUser.role === 'admin' || activeUser.role === 'superadmin'));

  return (
    <div className="space-y-4">
      {pendingOrganisations.map((organisation) => {
        const requester = accounts.find((account) => organisation.admins.includes(account.id));

        return (
          <article key={organisation.id} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft">
            <header className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-full"
                style={{ backgroundColor: organisation.brandColour }}
                aria-hidden
              />
              <div>
                <h3 className="text-lg font-semibold text-white">{organisation.name}</h3>
                <p className="text-xs uppercase text-slate-400">{organisation.type} – submitted {new Date(organisation.createdAt).toLocaleString()}</p>
              </div>
            </header>
            <p className="mt-4 text-sm text-slate-300">
              Requested by {requester?.profile.name ?? 'unknown member'}. Approve to give them organisation admin controls.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <button
                type="button"
                disabled={!canApprove}
                onClick={() => canApprove && approveOrganisation(organisation.id)}
                className={`rounded-full px-4 py-2 font-semibold transition ${
                  canApprove ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {canApprove ? 'Approve organisation' : 'Admin approval required'}
              </button>
              <span className="text-slate-400">
                Tip: approving publishes the brand colour and unlocks microsite controls for the requester.
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
