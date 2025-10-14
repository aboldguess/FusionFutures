/**
 * @file event-create-form.tsx
 * @description Mini README: Allows privileged roles to draft new events. Uses form validation, immediate feedback, and logs
 * submissions for debugging visibility.
 */

'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { logger } from '@/lib/logger';
import { usePlatformUser } from '@/hooks/use-platform-user';

const schema = z.object({
  title: z.string().min(5, 'Name your event clearly.'),
  summary: z.string().min(20, 'Share enough context so attendees know the purpose.'),
  location: z.string().min(3, 'Location or online link required.'),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  mode: z.enum(['in-person', 'online', 'hybrid']),
  visibility: z.enum(['public', 'private'])
});

type EventDraft = z.infer<typeof schema>;

export function EventCreateForm() {
  const { activeUser } = usePlatformUser();
  const [toast, setToast] = useState<string | null>(null);
  const form = useForm<EventDraft>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      summary: '',
      location: '',
      startDate: '',
      endDate: '',
      mode: 'hybrid',
      visibility: 'public'
    }
  });

  if (!activeUser) {
    return (
      <p className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-sm text-rose-200">
        Please sign in to create events. Administrators can approve new requests after login.
      </p>
    );
  }

  const onSubmit = (data: EventDraft) => {
    logger.info('Event draft created', { organiser: activeUser.profile.name, data });
    setToast('Event saved locally. In production you would now publish or request approval.');
    form.reset();
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft">
      <div className="mb-4 text-sm text-slate-300">
        <p className="font-semibold text-white">Plan an event in three steps:</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Complete the details below.</li>
          <li>Click save to notify moderators.</li>
          <li>Share the preview link with collaborators.</li>
        </ol>
      </div>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
        <label className="md:col-span-2 text-sm text-white">
          Event name
          <input
            {...form.register('title')}
            className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
          />
          {form.formState.errors.title && (
            <span className="mt-1 block text-xs text-rose-300">{form.formState.errors.title.message}</span>
          )}
        </label>
        <label className="md:col-span-2 text-sm text-white">
          Summary
          <textarea
            rows={3}
            {...form.register('summary')}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-white focus:border-brand focus:outline-none"
          />
          {form.formState.errors.summary && (
            <span className="mt-1 block text-xs text-rose-300">{form.formState.errors.summary.message}</span>
          )}
        </label>
        <label className="text-sm text-white">
          Location or link
          <input
            {...form.register('location')}
            className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
          />
          {form.formState.errors.location && (
            <span className="mt-1 block text-xs text-rose-300">{form.formState.errors.location.message}</span>
          )}
        </label>
        <label className="text-sm text-white">
          Start
          <input
            type="datetime-local"
            {...form.register('startDate')}
            className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
          />
          {form.formState.errors.startDate && (
            <span className="mt-1 block text-xs text-rose-300">Please provide a start date.</span>
          )}
        </label>
        <label className="text-sm text-white">
          Finish
          <input
            type="datetime-local"
            {...form.register('endDate')}
            className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
          />
          {form.formState.errors.endDate && (
            <span className="mt-1 block text-xs text-rose-300">Please provide an end date.</span>
          )}
        </label>
        <label className="text-sm text-white">
          Delivery mode
          <select
            {...form.register('mode')}
            className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
          >
            <option value="in-person">In person</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
        <label className="text-sm text-white">
          Visibility
          <select
            {...form.register('visibility')}
            className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
        <button
          type="submit"
          className="md:col-span-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Save event draft
        </button>
        {toast && <p className="md:col-span-2 rounded-full bg-emerald-500/20 px-4 py-2 text-xs text-emerald-200">{toast}</p>}
      </form>
    </div>
  );
}
