/**
 * @file admin/page.tsx
 * @description Mini README: Administrative control centre for content moderation, invitation management, and
 * organisation approvals.
 */

import { PageHeader } from '@/components/page-header';
import { AdminUserTable } from '@/components/admin-user-table';
import { AdminInvitationPanel } from '@/components/admin-invitation-panel';
import { AdminOrganisationQueue } from '@/components/admin-organisation-queue';

export default function AdminPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Admin Control Centre"
        description="Monitor platform health, moderate activity, and adjust branding. Follow the quick tasks to stay on top of governance."
        checklist={[
          'Review pending user approvals below and take action.',
          'Issue invitations to the next cohort of collaborators.',
          'Approve any newly submitted organisations to unlock branding controls.'
        ]}
      />
      <AdminInvitationPanel />
      <AdminOrganisationQueue />
      <AdminUserTable />
    </div>
  );
}
