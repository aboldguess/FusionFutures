/**
 * @file organisation-showcase.tsx
 * @description Mini README: Highlights employer and educator microsites, showing branding controls and linked users.
 */

import { users } from '@/data/users';

const showcase = users.filter((user) => user.organisation);

export function OrganisationShowcase() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {showcase.map((user) => (
        <article key={user.id} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft">
          <header className="flex items-center gap-4">
            <div
              className="h-12 w-12 rounded-full"
              style={{ backgroundColor: user.organisation?.colour }}
              aria-hidden
            />
            <div>
              <h3 className="text-xl font-semibold text-white">{user.organisation?.name}</h3>
              <p className="text-xs uppercase text-slate-400">{user.organisation?.type}</p>
            </div>
          </header>
          <p className="mt-4 text-sm text-slate-300">{user.profile.bio}</p>
          <ul className="mt-6 space-y-2 text-xs text-slate-300">
            <li>Lead contact: {user.profile.name}</li>
            <li>Preferred colour palette: {user.organisation?.colour}</li>
            <li>Featured talent: auto-populated from LinkedIn imports.</li>
          </ul>
          {user.profile.linkedin && (
            <a
              href={user.profile.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-light"
            >
              View LinkedIn profile ↗
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
