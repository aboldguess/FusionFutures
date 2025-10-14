/**
 * @file impact-feed.tsx
 * @description Mini README: Renders the LinkedIn-style impact feed featuring posts, reactions, and quick insights.
 * Includes inline instructions to encourage users to share updates and tracks link clicks for analytics.
 */

'use client';

import Image from 'next/image';
import { posts } from '@/data/posts';
import { users } from '@/data/users';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';
import { clsx } from 'clsx';
import { logger } from '@/lib/logger';
import { CreatePostForm } from '@/components/post-create-form';

export function ImpactFeed() {
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);

  const findAuthor = (id: string) => users.find((user) => user.id === id);

  return (
    <div className="space-y-6">
      <CreatePostForm />
      {posts.map((post) => {
        const author = findAuthor(post.authorId);
        const isHighlighted = highlightedPostId === post.id;

        return (
          <article
            key={post.id}
            className={clsx(
              'rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft transition hover:border-brand/40',
              isHighlighted && 'ring-2 ring-brand'
            )}
          >
            <header className="flex items-center gap-4">
              {author && (
                <Image
                  src={author.profile.avatar}
                  alt={author.profile.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">{author?.profile.name}</h3>
                <p className="text-sm text-slate-300">{author?.profile.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setHighlightedPostId(isHighlighted ? null : post.id)}
                className="ml-auto rounded-full bg-brand/20 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/30"
              >
                {isHighlighted ? 'Remove focus' : 'Focus this update'}
              </button>
            </header>
            <p className="mt-4 text-slate-200">{post.content}</p>
            {post.link && (
              <Link
                href={post.link}
                target="_blank"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-light"
                onClick={() => logger.info('Tracked external post link click', { postId: post.id })}
              >
                Visit linked resource ↗
              </Link>
            )}
            <footer className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              <span>👍 {post.stats.likes} likes</span>
              <span>💬 {post.stats.replies} replies</span>
              <span>📈 {post.stats.impact}</span>
              <div className="ml-auto flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">
                    #{tag}
                  </span>
                ))}
              </div>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
