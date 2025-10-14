/**
 * @file events.ts
 * @description Mini README: Seed data for the events hub showing how multi-role event ownership works. Demonstrates
 * different formats, locations, and attendee lists to power the UI visualisations.
 */

import type { EventRecord } from '@/types/platform';

export const events: EventRecord[] = [
  {
    id: 'event-1',
    ownerId: 'account-superadmin-001',
    title: 'Fusion Futures Launch Summit',
    summary: 'Unveiling the platform roadmap, onboarding toolkit, and cross-sector partnerships.',
    location: 'Science Museum, London / Livestream',
    startDate: '2024-07-01T09:00:00Z',
    endDate: '2024-07-01T16:00:00Z',
    mode: 'hybrid',
    visibility: 'public',
    banner: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    attendees: ['account-superadmin-001', 'account-admin-001', 'account-user-001'],
    contributors: ['account-admin-001', 'account-superadmin-001']
  },
  {
    id: 'event-2',
    ownerId: 'account-admin-001',
    title: 'Stellar Fusion Career Discovery Day',
    summary: 'Meet hiring managers, explore apprenticeship pathways, and connect with mentors.',
    location: 'Manchester Innovation Centre',
    startDate: '2024-07-12T10:00:00Z',
    endDate: '2024-07-12T15:00:00Z',
    mode: 'in-person',
    visibility: 'public',
    banner: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    attendees: ['account-user-001'],
    contributors: ['account-admin-001']
  },
  {
    id: 'event-3',
    ownerId: 'account-user-001',
    title: 'Educators Lab: Plasma Diagnostics Toolkit',
    summary: 'Co-designing lab sessions with industry mentors and scheduling upcoming placements.',
    location: 'Virtual Workshop',
    startDate: '2024-07-20T13:00:00Z',
    endDate: '2024-07-20T15:30:00Z',
    mode: 'online',
    visibility: 'private',
    banner: 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1200&q=80',
    attendees: ['account-user-001', 'account-superadmin-001'],
    contributors: ['account-user-001']
  }
];
