/**
 * @file post-create-form.tsx
 * @description Mini README: Demonstrates how a user could publish a new impact update. Uses react-hook-form and zod for
 * validation, emits debug logs, and stores entries client-side for demo purposes.
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { logger } from '@/lib/logger';
import { usePlatformUser } from '@/hooks/use-platform-user';
import { useImpactFeed } from '@/hooks/use-impact-feed';

const schema = z.object({
  content: z
    .string()
    .min(10, 'Share at least 10 characters so the community understands your update.')
    .max(500, 'Keep impact updates concise for clarity.'),
  link: z.string().url('Provide a full https:// link.').optional().or(z.literal(''))
});

type FormData = z.infer<typeof schema>;

export function CreatePostForm() {
  const { register, handleSubmit, reset, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: '',
      link: ''
    }
  });
  const { activeUser } = usePlatformUser();
  const { addPost } = useImpactFeed();
  const [toast, setToast] = useState<string | null>(null);

  const onSubmit = (data: FormData) => {
    const trimmedLink = data.link?.trim();

    // Ensure validation metadata and author linkage are captured before persisting the new update.
    addPost({
      authorId: activeUser.id,
      content: data.content.trim(),
      link: trimmedLink ? trimmedLink : undefined,
      tags: [activeUser.role]
    });

    logger.info('New impact update published to context', {
      author: activeUser.profile.name,
      role: activeUser.role
    });

    setToast('Update published to your local feed. In production this would notify your network.');
    reset();
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="content" className="text-sm font-semibold text-white">
            Share what you have achieved this week
          </label>
          <textarea
            id="content"
            {...register('content')}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-white focus:border-brand focus:outline-none"
            rows={4}
            placeholder="Example: Partnered with Stellar Fusion to host a bootcamp taster session..."
          />
          {formState.errors.content && (
            <p className="mt-1 text-xs text-rose-300">{formState.errors.content.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="link" className="text-sm font-semibold text-white">
            Optional resource link (recorded for impact analytics)
          </label>
          <input
            id="link"
            type="url"
            {...register('link')}
            className="mt-2 w-full rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
            placeholder="https://"
          />
          {formState.errors.link && <p className="mt-1 text-xs text-rose-300">{formState.errors.link.message}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Publish update
          </button>
          <span className="text-xs text-slate-300">
            Tip: highlight best practice, link to resources, and tag collaborators directly.
          </span>
        </div>
        {toast && <p className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs text-emerald-200">{toast}</p>}
      </form>
    </div>
  );
}
