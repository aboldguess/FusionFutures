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
    // Hash corresponds to the on-screen demo password "FusionSuperadmin!1" (SHA-256, computed client-side for parity).
    passwordHash: 'e795c30f4176c04f6d0cc40ab32d5a6cdf934e26b012eada7b835edc9ede533f',
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
    // Hash corresponds to the demo password "FusionAdmin!1" so administrators can successfully authenticate during demos.
    passwordHash: '43420991da18e4744ca1ce59f795000ebbb0e458b2578a04c2445d1a4242adb3',
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
    // Hash corresponds to the demo learner password "FusionUser!1" for the standard user walkthrough.
    passwordHash: '3d50a5f1d9422da0bc82a8c9216793b156b0ea5ab4b11f8ea1b9b221618d8f1d',
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
