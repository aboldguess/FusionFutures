/**
 * @file invite-signup-panel.tsx
 * @description Mini README: Client-side flow for redeeming invitations. Validates codes, collects profile details, and
 * submits the payload to the auth provider which handles account creation and organisation onboarding logic.
 */

'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatformUser } from '@/hooks/use-platform-user';
import type { OrganisationType } from '@/types/platform';
import { logger } from '@/lib/logger';

interface InviteSignupPanelProps {
  code: string;
}

type OrganisationStrategy = 'existing' | 'create';

type FormState = {
  fullName: string;
  title: string;
  location: string;
  bio: string;
  password: string;
  confirmPassword: string;
  organisationStrategy: OrganisationStrategy;
  existingOrganisationId?: string;
  newOrganisationName: string;
  newOrganisationType: OrganisationType;
  newOrganisationColour: string;
};

const initialFormState: FormState = {
  fullName: '',
  title: '',
  location: '',
  bio: '',
  password: '',
  confirmPassword: '',
  organisationStrategy: 'existing',
  existingOrganisationId: undefined,
  newOrganisationName: '',
  newOrganisationType: 'employer',
  newOrganisationColour: '#38bdf8'
};

export function InviteSignupPanel({ code }: InviteSignupPanelProps) {
  const router = useRouter();
  const { validateInvitation, completeInvitation, organisations } = usePlatformUser();
  const invitation = useMemo(() => validateInvitation(code), [code, validateInvitation]);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const invitationOrganisationId = invitation.invitation?.organisationId;
  const linkedOrganisation = useMemo(() => (
    invitationOrganisationId ? organisations.find((organisation) => organisation.id === invitationOrganisationId) : undefined
  ), [invitationOrganisationId, organisations]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!invitation.invitation || invitation.status !== 'pending') {
      return;
    }

    setFormState((previous) => ({
      ...previous,
      organisationStrategy: invitation.invitation.organisationId ? 'existing' : previous.organisationStrategy,
      existingOrganisationId: invitation.invitation.organisationId,
      newOrganisationName: invitation.invitation.organisationNameSuggestion ?? previous.newOrganisationName
    }));
  }, [invitation.invitation, invitation.status]);

  const approvedOrganisations = useMemo(
    () => organisations.filter((organisation) => organisation.status === 'approved'),
    [organisations]
  );

  if (!invitation.invitation) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
        Invitation not found. Double-check the code or request a new link from your administrator.
      </div>
    );
  }

  if (invitation.status !== 'pending') {
    return (
      <div className="space-y-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-sm text-amber-100">
        <p>This invitation can no longer be redeemed.</p>
        <p>Status: {invitation.status}. Contact an administrator to generate a fresh code.</p>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formState.password.length < 12) {
      setError('Use at least 12 characters for a secure password.');
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formState.organisationStrategy === 'existing' && !(
      invitation.invitation.organisationId || formState.existingOrganisationId
    )) {
      setError('Select an organisation to join or switch to creating a new one.');
      return;
    }

    if (formState.organisationStrategy === 'create' && !formState.newOrganisationName.trim()) {
      setError('Provide a name for the new organisation.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const result = await completeInvitation(code, {
      fullName: formState.fullName,
      title: formState.title,
      location: formState.location,
      bio: formState.bio,
      password: formState.password,
      organisationStrategy: formState.organisationStrategy,
      organisationId:
        formState.organisationStrategy === 'existing'
          ? invitation.invitation.organisationId ?? formState.existingOrganisationId
          : undefined,
      organisationName: formState.organisationStrategy === 'create' ? formState.newOrganisationName : undefined,
      organisationType: formState.organisationStrategy === 'create' ? formState.newOrganisationType : undefined,
      organisationColour: formState.organisationStrategy === 'create' ? formState.newOrganisationColour : undefined
    });

    setSubmitting(false);

    if (!result.success) {
      setError(result.message ?? 'Unable to complete signup.');
      return;
    }

    setStatusMessage('Invitation redeemed! Redirecting you to the dashboard…');
    logger.info('Invitation completed – redirecting new account');
    router.replace('/');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm text-slate-200">
        <h2 className="text-lg font-semibold text-white">Welcome, {invitation.invitation.email}</h2>
        <p className="mt-2 text-xs text-slate-300">
          You are joining as a <span className="font-semibold text-brand">{invitation.invitation.role}</span>. Complete the
          steps below to activate your account.
        </p>
        <dl className="mt-4 grid gap-3 text-xs text-slate-400 md:grid-cols-2">
          <div>
            <dt className="font-semibold text-white">Invitation issued</dt>
            <dd>{new Date(invitation.invitation.issuedAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="font-semibold text-white">Expires</dt>
            <dd>{new Date(invitation.invitation.expiresAt).toLocaleString()}</dd>
          </div>
          {invitation.invitation.message && (
            <div className="md:col-span-2">
              <dt className="font-semibold text-white">Admin note</dt>
              <dd>{invitation.invitation.message}</dd>
            </div>
          )}
        </dl>
      </section>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm text-slate-200">
          <h3 className="text-lg font-semibold text-white">Your profile</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-xs uppercase text-slate-400">
              Full name
              <input
                required
                value={formState.fullName}
                onChange={(event) => setFormState((previous) => ({ ...previous, fullName: event.target.value }))}
                className="mt-2 w-full rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                placeholder="First Last"
              />
            </label>
            <label className="text-xs uppercase text-slate-400">
              Role title
              <input
                required
                value={formState.title}
                onChange={(event) => setFormState((previous) => ({ ...previous, title: event.target.value }))}
                className="mt-2 w-full rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                placeholder="Head of Partnerships"
              />
            </label>
            <label className="text-xs uppercase text-slate-400">
              Location
              <input
                required
                value={formState.location}
                onChange={(event) => setFormState((previous) => ({ ...previous, location: event.target.value }))}
                className="mt-2 w-full rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                placeholder="City, Country"
              />
            </label>
            <label className="text-xs uppercase text-slate-400 md:col-span-2">
              Short bio
              <textarea
                required
                rows={3}
                value={formState.bio}
                onChange={(event) => setFormState((previous) => ({ ...previous, bio: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-sm text-white focus:border-brand focus:outline-none"
                placeholder="Explain how you will collaborate with the Fusion Futures community."
              />
            </label>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm text-slate-200">
          <h3 className="text-lg font-semibold text-white">Security</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="text-xs uppercase text-slate-400">
              Create password
              <input
                required
                type="password"
                value={formState.password}
                onChange={(event) => setFormState((previous) => ({ ...previous, password: event.target.value }))}
                className="mt-2 w-full rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                placeholder="At least 12 characters"
              />
            </label>
            <label className="text-xs uppercase text-slate-400">
              Confirm password
              <input
                required
                type="password"
                value={formState.confirmPassword}
                onChange={(event) => setFormState((previous) => ({ ...previous, confirmPassword: event.target.value }))}
                className="mt-2 w-full rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Passwords are hashed with SHA-256 in the browser before being stored. Use a password manager for production deployments.
          </p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm text-slate-200">
          <h3 className="text-lg font-semibold text-white">Organisation</h3>
          <p className="mt-2 text-xs text-slate-300">
            Choose how you want to appear on the platform. New organisations remain pending until an Admin reviews them.
          </p>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 text-xs text-slate-200">
              <input
                type="radio"
                name="organisationStrategy"
                value="existing"
                checked={formState.organisationStrategy === 'existing'}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    organisationStrategy: event.target.value as OrganisationStrategy
                  }))
                }
                disabled={Boolean(invitation.invitation.organisationId)}
              />
              Join an existing organisation
            </label>
            <label className="flex items-center gap-3 text-xs text-slate-200">
              <input
                type="radio"
                name="organisationStrategy"
                value="create"
                checked={formState.organisationStrategy === 'create'}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    organisationStrategy: event.target.value as OrganisationStrategy
                  }))
                }
              />
              Create a new organisation (requires admin approval)
            </label>
          </div>
          {formState.organisationStrategy === 'existing' ? (
            <div className="mt-4 space-y-3">
              {invitation.invitation.organisationId ? (
                <p className="rounded-full bg-slate-800/80 px-4 py-2 text-xs text-slate-200">
                  You will join <span className="font-semibold">{linkedOrganisation?.name ?? invitationOrganisationId}</span> once you finish signup.
                </p>
              ) : (
                <select
                  value={formState.existingOrganisationId ?? ''}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      existingOrganisationId: event.target.value || undefined
                    }))
                  }
                  className="mt-4 w-full rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                >
                  <option value="">Select an organisation</option>
                  {approvedOrganisations.map((organisation) => (
                    <option key={organisation.id} value={organisation.id}>
                      {organisation.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-xs uppercase text-slate-400 md:col-span-2">
                Organisation name
                <input
                  required
                  value={formState.newOrganisationName}
                  onChange={(event) => setFormState((previous) => ({ ...previous, newOrganisationName: event.target.value }))}
                  className="mt-2 w-full rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                  placeholder="Aurora Fusion Labs"
                />
              </label>
              <label className="text-xs uppercase text-slate-400">
                Type
                <select
                  value={formState.newOrganisationType}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      newOrganisationType: event.target.value as OrganisationType
                    }))
                  }
                  className="mt-2 w-full rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                >
                  <option value="employer">Employer</option>
                  <option value="institution">Institution</option>
                  <option value="hub">Hub</option>
                </select>
              </label>
              <label className="text-xs uppercase text-slate-400">
                Brand colour (hex)
                <input
                  value={formState.newOrganisationColour}
                  onChange={(event) => setFormState((previous) => ({ ...previous, newOrganisationColour: event.target.value }))}
                  className="mt-2 w-full rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                />
              </label>
            </div>
          )}
        </section>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          {isSubmitting ? 'Activating account…' : 'Activate my account'}
        </button>
      </form>
      {statusMessage && <p className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs text-emerald-200">{statusMessage}</p>}
      {error && <p className="rounded-full bg-rose-500/20 px-4 py-2 text-xs text-rose-200">{error}</p>}
    </div>
  );
}
