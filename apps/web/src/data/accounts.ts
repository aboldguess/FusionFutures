/**
 * @file accounts.ts
 * @description Mini README: Supplies seeded platform accounts used by the authentication context. The records mirror what a
 * real API would return for Superadmins, Admins, and standard Users. Each entry contains pre-hashed passwords, organisation
 * links, and audit metadata so flows such as login, invitation redemption, and impersonation can be developed without a
 * backend. Structure: strongly typed array of PlatformAccount objects ready for hydration by the auth provider.
 */

import type { PlatformAccount } from '@/types/platform';

export const seedAccounts: PlatformAccount[] = [
  {
    id: 'account-superadmin-001',
    email: 'amina.clarke@fusionfutures.example',
    role: 'superadmin',
    status: 'active',
    passwordHash: '2ce896c7ac6f040d9b3c6ce3f01ecb92d58628d9c082ffed2645b95f5e23fe63',
    createdAt: '2024-01-04T09:30:00.000Z',
    lastLogin: '2024-05-01T10:15:00.000Z',
    organisationAdmin: true,
    profile: {
      name: 'Dr. Amina Clarke',
      title: 'National Fusion Skills Hub Director',
      avatar: 'https://i.pravatar.cc/150?img=47',
      location: 'Culham, UK',
      bio: 'Oversees partnerships, curriculum quality, and national platform branding.'
    },
    organisation: {
      name: 'National Fusion Skills Hub',
      type: 'hub',
      colour: '#1f5eff'
    }
  },
  {
    id: 'account-admin-001',
    email: 'jonah.reid@fusionfutures.example',
    role: 'admin',
    status: 'active',
    passwordHash: '09e1553f419756e7882757fa10700387753ab66f3cd27e901243a25e0412f1ee',
    createdAt: '2024-02-10T11:00:00.000Z',
    lastLogin: '2024-04-22T12:40:00.000Z',
    organisationAdmin: true,
    invitedBy: 'account-superadmin-001',
    profile: {
      name: 'Jonah Reid',
      title: 'Community Success Lead',
      avatar: 'https://i.pravatar.cc/150?img=12',
      location: 'Bristol, UK',
      bio: 'Moderates discussions, curates learning journeys, and links talent with roles.'
    },
    organisation: {
      name: 'Fusion Futures Operations',
      type: 'institution',
      colour: '#f97316'
    }
  },
  {
    id: 'account-user-001',
    email: 'ellie.morgan@fusionfutures.example',
    role: 'user',
    status: 'active',
    passwordHash: '83dee1e879747d9c33df963e731439ce48b62983044fcddfce4d5db77e6fa42f',
    createdAt: '2024-03-05T08:00:00.000Z',
    lastLogin: '2024-04-28T09:10:00.000Z',
    organisationAdmin: true,
    invitedBy: 'account-admin-001',
    profile: {
      name: 'Ellie Morgan',
      title: 'Early-career Systems Engineer',
      avatar: 'https://i.pravatar.cc/150?img=25',
      location: 'Cardiff, UK',
      bio: 'Upskilling in plasma diagnostics while seeking collaborative employers.',
      linkedin: 'https://www.linkedin.com/in/ellie-morgan-fusion'
    },
    organisation: {
      name: 'Stellar Fusion Ltd.',
      type: 'employer',
      colour: '#22d3ee'
    }
  }
];
