/**
 * @file admin/page.tsx
 * @description Mini README: Administrative control centre for content moderation and user management.
 */

import { PageHeader } from '@/components/page-header';
import { AdminUserTable } from '@/components/admin-user-table';

export default function AdminPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Admin Control Centre"
        description="Monitor platform health, moderate activity, and adjust branding. Follow the quick tasks to stay on top of governance."
        checklist={[
          'Review pending user approvals below and take action.',
          'Spotlight a post on the Impact Feed to reward community engagement.',
          'Rotate the platform colour palette to keep things fresh.'
        ]}
      />
      <AdminUserTable />
    </div>
  );
}
