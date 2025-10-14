/**
 * @file events-gallery.tsx
 * @description Mini README: Visualises events in a responsive gallery with key metadata, enabling quick discovery of
 * upcoming opportunities. Resolves event owners via the live auth context so new administrators appear without code
 * changes.
 */

import Image from 'next/image';
import { format } from 'date-fns';
import { events } from '@/data/events';
import { usePlatformUser } from '@/hooks/use-platform-user';

export function EventsGallery() {
  const { accounts } = usePlatformUser();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {events.map((event) => {
        const owner = accounts.find((account) => account.id === event.ownerId);
        return (
          <article key={event.id} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-soft">
            <div className="relative h-44 w-full">
              <Image
                src={event.banner}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                {event.visibility.toUpperCase()}
              </span>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                {owner && (
                  <Image
                    src={owner.profile.avatar}
                    alt={owner.profile.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                  <p className="text-xs text-slate-300">
                    Hosted by {owner?.profile.name ?? 'unassigned – allocate an owner via Admin > Manage Users'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-300">{event.summary}</p>
              <dl className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div>
                  <dt className="font-semibold text-white">When</dt>
                  <dd>
                    {format(new Date(event.startDate), 'PPPp')} – {format(new Date(event.endDate), 'PPPp')}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Where</dt>
                  <dd>{event.location}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Delivery</dt>
                  <dd>{event.mode}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">Delegates</dt>
                  <dd>{event.attendees.length} confirmed</dd>
                </div>
              </dl>
              <button
                type="button"
                className="w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Join event or share privately
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
