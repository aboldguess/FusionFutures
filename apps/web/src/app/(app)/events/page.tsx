/**
 * @file events/page.tsx
 * @description Mini README: Events hub featuring creation form and gallery view.
 */

import { PageHeader } from '@/components/page-header';
import { EventCreateForm } from '@/components/event-create-form';
import { EventsGallery } from '@/components/events-gallery';

export default function EventsPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Events Hub"
        description="Publish recruitment fairs, research labs, and community touchpoints. Use the quick checklist to launch in minutes."
        checklist={[
          'Complete the event draft below (takes less than 2 minutes).',
          'Share the preview with your co-hosts for approval.',
          'Push to the Impact Feed once you are ready.'
        ]}
      />
      <EventCreateForm />
      <EventsGallery />
    </div>
  );
}
