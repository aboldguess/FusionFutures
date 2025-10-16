/**
 * @file event-management-panel.tsx
 * @description Mini README: Administrator workspace for event CRUD and attendee management. The panel renders each
 * event with inline edit controls, ownership reassignment, attendance toggles, and a safety reset option that
 * restores the seeded dataset. Structure: React hook imports, helper utilities, main panel component, and reusable
 * card component to keep the UI readable.
 */

'use client';

import { FormEvent, useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { EventRecord, PlatformAccount } from '@/types/platform';
import { useEvents } from '@/hooks/use-events';
import { usePlatformUser } from '@/hooks/use-platform-user';
import { logger } from '@/lib/logger';

interface EventFormDraft {
  title: string;
  summary: string;
  location: string;
  startDate: string;
  endDate: string;
  mode: EventRecord['mode'];
  visibility: EventRecord['visibility'];
  ownerId: string;
}

function toInputDateValue(isoDate: string) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function buildDraft(event: EventRecord): EventFormDraft {
  return {
    title: event.title,
    summary: event.summary,
    location: event.location,
    startDate: toInputDateValue(event.startDate),
    endDate: toInputDateValue(event.endDate),
    mode: event.mode,
    visibility: event.visibility,
    ownerId: event.ownerId
  };
}

export function EventManagementPanel() {
  const { events, resetEvents, updateEvent, deleteEvent, registerAttendee, removeAttendee } = useEvents();
  const { accounts, activeUser } = usePlatformUser();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!activeUser) {
    return (
      <p className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-sm text-rose-200">
        Sign in to access moderation tools. Once authenticated you can edit event content, invite guests, and retire outdated
        drafts.
      </p>
    );
  }

  const canAdministerAll = activeUser.role === 'superadmin' || activeUser.role === 'admin';

  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Manage live events</h2>
          <p className="text-sm text-slate-300">
            Update timings, switch owners, and curate attendee lists without leaving this dashboard. All changes persist locally
            for easy demos.
          </p>
        </div>
        {canAdministerAll && (
          <button
            type="button"
            onClick={() => {
              resetEvents();
              setStatusMessage('Events restored to the original demo dataset.');
            }}
            className="rounded-full border border-brand/40 px-4 py-2 text-xs font-semibold text-brand hover:bg-brand/10"
          >
            Reset to demo data
          </button>
        )}
      </div>
      {statusMessage && (
        <p className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs text-emerald-200">{statusMessage}</p>
      )}
      {events.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-white/10 bg-slate-950/60 p-6 text-sm text-slate-300">
          You have no scheduled events yet. Draft a new activity above and it will appear here ready for moderation.
        </p>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <EventManagementCard
              key={event.id}
              event={event}
              accounts={accounts}
              canAdministerAll={canAdministerAll}
              activeAccountId={activeUser.id}
              onUpdate={updateEvent}
              onDelete={deleteEvent}
              onAddAttendee={registerAttendee}
              onRemoveAttendee={removeAttendee}
              reportStatus={setStatusMessage}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface EventManagementCardProps {
  event: EventRecord;
  accounts: PlatformAccount[];
  activeAccountId: string;
  canAdministerAll: boolean;
  onUpdate: (eventId: string, updates: Partial<Omit<EventRecord, 'id'>>) => void;
  onDelete: (eventId: string) => void;
  onAddAttendee: (eventId: string, accountId: string) => void;
  onRemoveAttendee: (eventId: string, accountId: string) => void;
  reportStatus: (message: string) => void;
}

function EventManagementCard({
  event,
  accounts,
  activeAccountId,
  canAdministerAll,
  onUpdate,
  onDelete,
  onAddAttendee,
  onRemoveAttendee,
  reportStatus
}: EventManagementCardProps) {
  const [draft, setDraft] = useState<EventFormDraft>(() => buildDraft(event));
  const [expanded, setExpanded] = useState<boolean>(false);
  const [attendeeSelection, setAttendeeSelection] = useState<string>('');

  useEffect(() => {
    setDraft(buildDraft(event));
  }, [event]);

  const canManage = canAdministerAll || event.ownerId === activeAccountId;
  const availableAttendees = useMemo(
    () => accounts.filter((account) => !event.attendees.includes(account.id)),
    [accounts, event.attendees]
  );

  const ownerOptions = useMemo(() => accounts.filter((account) => account.status === 'active'), [accounts]);

  const handleSubmit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();

    if (!canManage) {
      reportStatus('You do not have permission to update this event.');
      logger.warn('Blocked unauthorised event update attempt', { eventId: event.id, actor: activeAccountId });
      return;
    }

    onUpdate(event.id, {
      title: draft.title,
      summary: draft.summary,
      location: draft.location,
      startDate: draft.startDate,
      endDate: draft.endDate,
      mode: draft.mode,
      visibility: draft.visibility,
      ownerId: draft.ownerId
    });
    reportStatus(`Saved updates to ${draft.title}.`);
  };

  const handleDelete = () => {
    if (!canManage) {
      reportStatus('You do not have permission to delete this event.');
      logger.warn('Blocked unauthorised event delete attempt', { eventId: event.id, actor: activeAccountId });
      return;
    }

    const confirmed = typeof window !== 'undefined' ? window.confirm('Remove this event? Attendee records will be cleared.') : true;
    if (!confirmed) {
      return;
    }

    onDelete(event.id);
    reportStatus(`${event.title} removed. Ask the team before deleting production events.`);
  };

  const handleAddAttendee = () => {
    if (!attendeeSelection) {
      return;
    }

    onAddAttendee(event.id, attendeeSelection);
    setAttendeeSelection('');
    reportStatus('Attendee added to the guest list.');
  };

  const handleRemoveAttendee = (accountId: string) => {
    onRemoveAttendee(event.id, accountId);
    reportStatus('Attendee removed from the guest list.');
  };

  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/60">
      <header className="flex items-center gap-4 p-5">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">{event.title}</h3>
          <p className="text-xs text-slate-300">{format(new Date(event.startDate), 'PPPp')} · {event.location}</p>
        </div>
        <button
          type="button"
          className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
          onClick={() => setExpanded((previous) => !previous)}
        >
          {expanded ? 'Hide details' : 'Edit event'}
        </button>
      </header>
      {expanded && (
        <div className="space-y-6 border-t border-white/5 p-5">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
              Event title
              <input
                value={draft.title}
                onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
                className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                required
              />
            </label>
            <label className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
              Summary
              <textarea
                value={draft.summary}
                onChange={(event) => setDraft((previous) => ({ ...previous, summary: event.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-white focus:border-brand focus:outline-none"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Location or link
              <input
                value={draft.location}
                onChange={(event) => setDraft((previous) => ({ ...previous, location: event.target.value }))}
                className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Owner
              <select
                value={draft.ownerId}
                onChange={(event) => setDraft((previous) => ({ ...previous, ownerId: event.target.value }))}
                className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
              >
                {ownerOptions.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.profile.name} – {account.role}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Start
              <input
                type="datetime-local"
                value={draft.startDate}
                onChange={(event) => setDraft((previous) => ({ ...previous, startDate: event.target.value }))}
                className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Finish
              <input
                type="datetime-local"
                value={draft.endDate}
                onChange={(event) => setDraft((previous) => ({ ...previous, endDate: event.target.value }))}
                className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
                required
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Delivery mode
              <select
                value={draft.mode}
                onChange={(event) => setDraft((previous) => ({ ...previous, mode: event.target.value as EventRecord['mode'] }))}
                className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
              >
                <option value="in-person">In person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Visibility
              <select
                value={draft.visibility}
                onChange={(event) => setDraft((previous) => ({ ...previous, visibility: event.target.value as EventRecord['visibility'] }))}
                className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </label>
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
                disabled={!canManage}
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={() => setDraft(buildDraft(event))}
                className="rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Revert edits
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="ml-auto rounded-full border border-rose-400/60 px-5 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/20"
              >
                Delete event
              </button>
              {!canManage && (
                <span className="text-xs text-amber-200">
                  You can view this record but only the owner or an administrator can update it.
                </span>
              )}
            </div>
          </form>
          <div>
            <h4 className="text-sm font-semibold text-white">Confirmed attendees</h4>
            {event.attendees.length === 0 ? (
              <p className="mt-2 rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-4 text-xs text-slate-300">
                No attendees yet. Use the picker below to invite colleagues or learners.
              </p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-2">
                {event.attendees.map((attendeeId) => {
                  const attendee = accounts.find((account) => account.id === attendeeId);
                  return (
                    <li key={attendeeId} className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                      <span>{attendee?.profile.name ?? 'Unknown member'}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(attendeeId)}
                        className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-rose-200"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
              <select
                value={attendeeSelection}
                onChange={(event) => setAttendeeSelection(event.target.value)}
                className="flex-1 rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
              >
                <option value="">Select attendee</option>
                {availableAttendees.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.profile.name} – {account.role}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddAttendee}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Add attendee
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
