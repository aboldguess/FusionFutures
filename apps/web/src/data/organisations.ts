/**
 * @file organisations.ts
 * @description Mini README: Lists the seed organisations referenced by accounts and invitation flows. The dataset mirrors
 * what a service like Supabase or Hasura might expose, including approval status and admin ownership. The auth provider uses
 * these records when users request to join an existing organisation or submit new organisations for review.
 */

import type { OrganisationRecord } from '@/types/platform';

export const seedOrganisations: OrganisationRecord[] = [
  {
    id: 'org-hub-001',
    name: 'National Fusion Skills Hub',
    type: 'hub',
    status: 'approved',
    brandColour: '#1f5eff',
    createdAt: '2023-12-01T09:00:00.000Z',
    createdBy: 'account-superadmin-001',
    admins: ['account-superadmin-001']
  },
  {
    id: 'org-ops-001',
    name: 'Fusion Futures Operations',
    type: 'institution',
    status: 'approved',
    brandColour: '#f97316',
    createdAt: '2024-01-12T10:00:00.000Z',
    createdBy: 'account-superadmin-001',
    admins: ['account-admin-001']
  },
  {
    id: 'org-employer-001',
    name: 'Stellar Fusion Ltd.',
    type: 'employer',
    status: 'approved',
    brandColour: '#22d3ee',
    createdAt: '2024-02-01T10:30:00.000Z',
    createdBy: 'account-admin-001',
    admins: ['account-user-001']
  }
];
