/**
 * @file users.ts
 * @description Mini README: Provides curated mock user data representing each role in the Fusion Futures ecosystem.
 * Used by the platform user context and UI components to simulate behaviour until a real API is integrated.
 */

import type { PlatformUser } from '@/types/platform';

export const users: PlatformUser[] = [
  {
    id: 'user-superadmin-1',
    role: 'superadmin',
    profile: {
      name: 'Dr. Amina Clarke',
      title: 'National Fusion Skills Hub Director',
      avatar: 'https://i.pravatar.cc/150?img=47',
      location: 'Culham, UK',
      bio: 'Overseeing partnerships, curriculum quality, and national platform branding.'
    },
    organisation: {
      name: 'National Fusion Skills Hub',
      type: 'hub',
      colour: '#1f5eff'
    }
  },
  {
    id: 'user-admin-1',
    role: 'admin',
    profile: {
      name: 'Jonah Reid',
      title: 'Community Success Lead',
      avatar: 'https://i.pravatar.cc/150?img=12',
      location: 'Bristol, UK',
      bio: 'Moderates discussions, curates learning journeys, and links talent with roles.'
    },
    organisation: {
      name: 'Fusion Futures Operations',
      type: 'hub',
      colour: '#f97316'
    }
  },
  {
    id: 'user-employer-1',
    role: 'employer',
    profile: {
      name: 'Priya Shah',
      title: 'Talent Partner at Stellar Fusion Ltd.',
      avatar: 'https://i.pravatar.cc/150?img=32',
      location: 'Manchester, UK',
      bio: 'Building the future fusion workforce through targeted outreach and mentorship.'
    },
    organisation: {
      name: 'Stellar Fusion Ltd.',
      type: 'employer',
      colour: '#22d3ee'
    }
  },
  {
    id: 'user-educator-1',
    role: 'educator',
    profile: {
      name: 'Professor Liam Patel',
      title: 'Head of Fusion Engineering, Northshore University',
      avatar: 'https://i.pravatar.cc/150?img=5',
      location: 'Newcastle, UK',
      bio: 'Designs cross-industry curricula and research placements for learners.'
    },
    organisation: {
      name: 'Northshore University',
      type: 'institution',
      colour: '#a855f7'
    }
  },
  {
    id: 'user-jobseeker-1',
    role: 'jobseeker',
    profile: {
      name: 'Ellie Morgan',
      title: 'Early-career Systems Engineer',
      avatar: 'https://i.pravatar.cc/150?img=25',
      location: 'Cardiff, UK',
      bio: 'Upskilling in plasma diagnostics while seeking collaborative employers.',
      linkedin: 'https://www.linkedin.com/in/ellie-morgan-fusion'
    }
  },
  {
    id: 'user-learner-1',
    role: 'learner',
    profile: {
      name: 'Lucas Grant',
      title: 'Fusion Skills Bootcamp Participant',
      avatar: 'https://i.pravatar.cc/150?img=56',
      location: 'Sheffield, UK',
      bio: 'Documenting learning journey in the Fusion Futures Learning Zone.'
    }
  }
];
