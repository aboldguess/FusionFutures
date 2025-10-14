/**
 * @file organisation-showcase.tsx
 * @description Mini README: Highlights employer and educator microsites, showing branding controls and linked users. Uses
 * the organisation records from the auth provider so new submissions instantly surface for admin review.
 */

import { usePlatformUser } from '@/hooks/use-platform-user';

export function OrganisationShowcase() {
  const { organisations, accounts } = usePlatformUser();
  const approvedOrganisations = organisations.filter((organisation) => organisation.status === 'approved');

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {approvedOrganisations.map((organisation) => {
        const leadAdmin = accounts.find((account) => organisation.admins.includes(account.id));

        return (
          <article key={organisation.id} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft">
            <header className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-full"
                style={{ backgroundColor: organisation.brandColour }}
                aria-hidden
              />
              <div>
                <h3 className="text-xl font-semibold text-white">{organisation.name}</h3>
                <p className="text-xs uppercase text-slate-400">{organisation.type}</p>
              </div>
            </header>
            <p className="mt-4 text-sm text-slate-300">
              {leadAdmin?.profile.bio ??
                'Invite an administrator to add guidance and publish your organisation story. Pending organisations show below.'}
            </p>
            <ul className="mt-6 space-y-2 text-xs text-slate-300">
              <li>Lead contact: {leadAdmin?.profile.name ?? 'Assign via Admin > Manage Users'}</li>
              <li>Preferred colour palette: {organisation.brandColour}</li>
              <li>Governance: {leadAdmin ? 'Active admin assigned' : 'Awaiting admin link'}</li>
            </ul>
            {leadAdmin?.profile.linkedin && (
              <a
                href={leadAdmin.profile.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-light"
              >
                View LinkedIn profile ↗
              </a>
            )}
          </article>
        );
      })}
    </div>
  );
}
