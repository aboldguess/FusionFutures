/**
 * @file admin-invitation-panel.tsx
 * @description Mini README: Admin-side form and dashboard for issuing, tracking, and revoking invitation links. The
 * component validates key details and surfaces copy-ready codes for quick distribution.
 */

'use client';

import { FormEvent, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { usePlatformUser } from '@/hooks/use-platform-user';

interface InvitationFormState {
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  organisationId?: string;
  expiresInDays: number;
  message?: string;
}

const defaultFormState: InvitationFormState = {
  email: '',
  role: 'user',
  organisationId: undefined,
  expiresInDays: 14,
  message: ''
};

export function AdminInvitationPanel() {
  const { invitations, issueInvitation, revokeInvitation, validateInvitation, organisations, activeUser } =
    usePlatformUser();
  const [formState, setFormState] = useState<InvitationFormState>(defaultFormState);
  const [isSubmitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolvedInvitations = useMemo(() => {
    return invitations
      .map((invitation) => {
        const { status } = validateInvitation(invitation.code);
        return { ...invitation, status };
      })
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }, [invitations, validateInvitation]);

  const approvedOrganisations = useMemo(
    () => organisations.filter((organisation) => organisation.status === 'approved'),
    [organisations]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeUser || (activeUser.role !== 'admin' && activeUser.role !== 'superadmin')) {
      setError('Only administrators can send invitations.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const invitation = await issueInvitation({
        email: formState.email,
        role: formState.role,
        organisationId: formState.organisationId || undefined,
        expiresInDays: formState.expiresInDays,
        message: formState.message
      });

      setToast(`Invitation created: ${invitation.code}. Share this code securely with ${invitation.email}.`);
      setFormState(defaultFormState);
    } catch (invitationError) {
      setError(invitationError instanceof Error ? invitationError.message : 'Unable to issue the invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-white">Invitation centre</h2>
        <p className="text-xs text-slate-300">
          Generate invite-only access links. Share codes via secure channels and track redemption below.
        </p>
      </div>
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="text-xs text-slate-300">
          Email address
          <input
            required
            type="email"
            value={formState.email}
            onChange={(event) => setFormState((previous) => ({ ...previous, email: event.target.value }))}
            className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
            placeholder="person@example.com"
          />
        </label>
        <label className="text-xs text-slate-300">
          Role to assign
          <select
            value={formState.role}
            onChange={(event) => setFormState((previous) => ({ ...previous, role: event.target.value as InvitationFormState['role'] }))}
            className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </label>
        <label className="text-xs text-slate-300">
          Link to an existing organisation (optional)
          <select
            value={formState.organisationId ?? ''}
            onChange={(event) =>
              setFormState((previous) => ({
                ...previous,
                organisationId: event.target.value === '' ? undefined : event.target.value
              }))
            }
            className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
          >
            <option value="">No automatic organisation</option>
            {approvedOrganisations.map((organisation) => (
              <option key={organisation.id} value={organisation.id}>
                {organisation.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-300">
          Expiry window (days)
          <input
            type="number"
            min={1}
            max={60}
            value={formState.expiresInDays}
            onChange={(event) =>
              setFormState((previous) => ({ ...previous, expiresInDays: Number.parseInt(event.target.value, 10) || 14 }))
            }
            className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
          />
        </label>
        <label className="md:col-span-2 text-xs text-slate-300">
          Optional welcome note (included in the invite email template)
          <textarea
            value={formState.message}
            onChange={(event) => setFormState((previous) => ({ ...previous, message: event.target.value }))}
            className="mt-2 h-20 w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-white focus:border-brand focus:outline-none"
          />
        </label>
        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={clsx(
              'rounded-full px-6 py-2 text-sm font-semibold text-white transition',
              isSubmitting ? 'bg-slate-700 cursor-not-allowed' : 'bg-brand hover:bg-brand-dark'
            )}
          >
            {isSubmitting ? 'Issuing invitation…' : 'Generate invite code'}
          </button>
          <p className="text-xs text-slate-300">
            Heads-up: codes expire automatically. Regenerate if a collaborator misses their window.
          </p>
        </div>
        {toast && <p className="md:col-span-2 rounded-full bg-emerald-500/20 px-4 py-2 text-xs text-emerald-200">{toast}</p>}
        {error && <p className="md:col-span-2 rounded-full bg-rose-500/20 px-4 py-2 text-xs text-rose-200">{error}</p>}
      </form>
      <div className="mt-8 space-y-3">
        <h3 className="text-sm font-semibold text-white">Recent invitations</h3>
        <div className="overflow-hidden rounded-2xl border border-white/5">
          <table className="min-w-full divide-y divide-white/5 text-left text-sm text-slate-200">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-300">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {resolvedInvitations.map((invitation) => (
                <tr key={invitation.code}>
                  <td className="px-4 py-3">{invitation.email}</td>
                  <td className="px-4 py-3 font-mono text-xs">{invitation.code}</td>
                  <td className="px-4 py-3 capitalize">{invitation.role}</td>
                  <td className="px-4 py-3 text-xs uppercase">{invitation.status}</td>
                  <td className="px-4 py-3 text-xs text-slate-300">
                    {new Date(invitation.expiresAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 text-xs">
                      {invitation.status === 'pending' && (
                        <button
                          type="button"
                          className="rounded-full bg-white/10 px-3 py-1 hover:bg-brand/40"
                          onClick={() => revokeInvitation(invitation.code)}
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        type="button"
                        className="rounded-full bg-white/10 px-3 py-1 hover:bg-brand/40"
                        onClick={async () => {
                          if (navigator?.clipboard) {
                            await navigator.clipboard.writeText(invitation.code);
                            setToast(`Copied "${invitation.code}" to the clipboard.`);
                          } else {
                            setToast('Clipboard access is not available in this browser.');
                          }
                        }}
                      >
                        Copy code
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
