/**
 * @file use-impact-feed.tsx
 * @description Mini README: Manages the Impact Feed state, including seeded demo posts, client-side persistence,
 * and helper actions for adding new updates. Structure: imports, types/constants, context definition, provider
 * implementation with localStorage hydration, and convenience hook for consumers.
 */

'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { posts as seededPosts } from '@/data/posts';
import type { ImpactPost } from '@/types/platform';
import { logger } from '@/lib/logger';

interface ImpactFeedContextValue {
  posts: ImpactPost[];
  addPost: (payload: NewImpactPostPayload) => void;
}

interface NewImpactPostPayload {
  authorId: string;
  content: string;
  link?: string;
  tags?: string[];
}

const STORAGE_KEY = 'impact-feed-posts';

const ImpactFeedContext = createContext<ImpactFeedContextValue | undefined>(undefined);

export function ImpactFeedProvider({ children }: { children: ReactNode }) {
  // Initialise state lazily to avoid server-side localStorage access.
  const [feedPosts, setFeedPosts] = useState<ImpactPost[]>(() => seededPosts);

  // Hydrate from localStorage on the client to preserve demo interactions across refreshes.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: ImpactPost[] = JSON.parse(raw);
        if (Array.isArray(stored) && stored.length > 0) {
          setFeedPosts(stored);
          logger.info('Impact feed hydrated from localStorage', { count: stored.length });
        } else {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seededPosts));
          logger.info('Impact feed storage empty – reseeded with defaults');
        }
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seededPosts));
        logger.info('Impact feed storage missing – saved initial seed posts');
      }
    } catch (error) {
      logger.error('Failed to hydrate impact feed from localStorage', { error });
    }
  }, []);

  const addPost = useCallback(
    ({ authorId, content, link, tags }: NewImpactPostPayload) => {
      const timestamp = new Date().toISOString();
      const postId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `post-${Date.now()}`;

      const nextPost: ImpactPost = {
        id: postId,
        authorId,
        content,
        link,
        createdAt: timestamp,
        stats: {
          likes: 0,
          replies: 0,
          impact: 'Impact analytics pending'
        },
        tags: tags ?? []
      };

      setFeedPosts((previous) => {
        const next = [nextPost, ...previous];
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch (error) {
            logger.error('Failed to persist new impact post to localStorage', { error });
          }
        }
        logger.info('Impact feed post added', { id: postId, authorId, createdAt: timestamp });
        return next;
      });
    },
    []
  );

  const value = useMemo<ImpactFeedContextValue>(
    () => ({
      posts: feedPosts,
      addPost
    }),
    [feedPosts, addPost]
  );

  return <ImpactFeedContext.Provider value={value}>{children}</ImpactFeedContext.Provider>;
}

export function useImpactFeed() {
  const context = useContext(ImpactFeedContext);

  if (!context) {
    throw new Error('useImpactFeed must be used within an ImpactFeedProvider');
  }

  return context;
}
