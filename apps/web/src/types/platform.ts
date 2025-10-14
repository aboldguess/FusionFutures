/**
 * @file platform.ts
 * @description Mini README: Contains TypeScript types shared across the Fusion Futures app, including user, post, event,
 * and organisation models. These typings keep UI components safe and self-documenting.
 */

export type UserRole = 'learner' | 'jobseeker' | 'employer' | 'educator' | 'admin' | 'superadmin';

export interface PlatformUser {
  id: string;
  role: UserRole;
  profile: {
    name: string;
    title: string;
    avatar: string;
    location: string;
    bio: string;
    linkedin?: string;
  };
  organisation?: {
    name: string;
    type: 'employer' | 'institution' | 'hub';
    colour: string;
  };
}

export interface ImpactPost {
  id: string;
  authorId: string;
  content: string;
  link?: string;
  createdAt: string;
  stats: {
    likes: number;
    replies: number;
    impact: string;
  };
  tags: string[];
}

export interface EventRecord {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  location: string;
  startDate: string;
  endDate: string;
  mode: 'in-person' | 'online' | 'hybrid';
  visibility: 'public' | 'private';
  banner: string;
  attendees: string[];
  contributors: string[];
}

export interface ConnectionInsight {
  id: string;
  metric: string;
  value: number;
  change: number;
  description: string;
}
