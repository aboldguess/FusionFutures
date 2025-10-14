/**
 * @file employers/page.tsx
 * @description Mini README: Landing page for employers and educators to manage microsites, branding, and collaborative
 * storytelling.
 */

import { PageHeader } from '@/components/page-header';
import { OrganisationShowcase } from '@/components/organisation-showcase';

export default function EmployersPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Employers & Educators"
        description="Celebrate your organisation and invite collaborators. The cards below preview the microsite experience."
        checklist={[
          'Upload your banner and colour palette using the admin controls.',
          'Invite colleagues to link themselves to your organisation.',
          'Add current opportunities so learners and jobseekers can engage.'
        ]}
      />
      <OrganisationShowcase />
    </div>
  );
}
