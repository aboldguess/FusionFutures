/**
 * @file posts.ts
 * @description Mini README: Contains seeded social posts for the Impact Feed. Posts reference authors from the user dataset
 * and include impact analytics to demonstrate insights.
 */

import type { ImpactPost } from '@/types/platform';

export const posts: ImpactPost[] = [
  {
    id: 'post-1',
    authorId: 'account-superadmin-001',
    content:
      'SuperAdmins just published the national fusion upskilling framework. Explore the interactive modules and align your talent plans.',
    link: 'https://fusionfutures.org/framework',
    createdAt: '2024-06-12T08:30:00Z',
    stats: {
      likes: 128,
      replies: 34,
      impact: '+42% engagement week-on-week'
    },
    tags: ['policy', 'skills', 'strategy']
  },
  {
    id: 'post-2',
    authorId: 'account-admin-001',
    content:
      'Stellar Fusion is hosting open mentorship sessions with engineers and data scientists. Secure your slot before places fill up.',
    link: 'https://stellar-fusion.co.uk/mentorship',
    createdAt: '2024-06-15T10:00:00Z',
    stats: {
      likes: 89,
      replies: 19,
      impact: '36 sign-ups from early-career talent'
    },
    tags: ['mentoring', 'employer', 'events']
  },
  {
    id: 'post-3',
    authorId: 'account-user-001',
    content:
      'New research collaboration opportunities in plasma diagnostics – educators can onboard projects with a single click.',
    createdAt: '2024-06-16T12:15:00Z',
    stats: {
      likes: 54,
      replies: 11,
      impact: '12 institutions collaborating'
    },
    tags: ['research', 'education', 'collaboration']
  }
];
