/**
 * @file page.tsx
 * @description Mini README: Home route presenting the impact feed, insight KPIs, and onboarding guidance.
 */

import { PageHeader } from '@/components/page-header';
import { InsightGrid } from '@/components/insight-grid';
import { ImpactFeed } from '@/components/impact-feed';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Impact Feed"
        description="Share wins, celebrate partnerships, and learn from peers. Follow the steps below to get started right now."
        checklist={[
          'Post an update explaining your latest achievement or question.',
          'React to at least one peer post to grow your network.',
          'Use the quick role switcher to preview how others experience the feed.'
        ]}
      />
      <InsightGrid />
      <ImpactFeed />
    </div>
  );
}
