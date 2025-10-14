/**
 * @file role-badge.tsx
 * @description Mini README: Simple visual badge showing the current user's role with contextual messaging to remind
 * people which permissions are active.
 */

import { UserRole } from '@/types/platform';

const roleCopy: Record<UserRole, string> = {
  learner: 'Learner mode – track your progress and learning goals.',
  jobseeker: 'Jobseeker mode – update your profile and explore live roles.',
  employer: 'Employer mode – manage briefs and connect with talent.',
  educator: 'Educator mode – curate learning resources and placements.',
  admin: 'Admin mode – moderate content and support community health.',
  superadmin: 'SuperAdmin mode – platform branding and policy controls.'
};

const roleColours: Record<UserRole, string> = {
  learner: 'bg-emerald-500/20 text-emerald-200',
  jobseeker: 'bg-sky-500/20 text-sky-200',
  employer: 'bg-cyan-500/20 text-cyan-200',
  educator: 'bg-violet-500/20 text-violet-200',
  admin: 'bg-amber-500/20 text-amber-200',
  superadmin: 'bg-brand/30 text-white'
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`rounded-full px-4 py-2 text-xs font-semibold ${roleColours[role]}`}>{roleCopy[role]}</span>
  );
}
