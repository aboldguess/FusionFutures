/**
 * @file insights.ts
 * @description Mini README: Stores key impact metrics surfaced on the dashboard cards. Values mimic analytics from future
 * backend services and feed the insight grid component.
 */

import type { ConnectionInsight } from '@/types/platform';

export const insights: ConnectionInsight[] = [
  {
    id: 'insight-1',
    metric: 'Connections fostered',
    value: 428,
    change: 18,
    description: 'New cross-organisation introductions created in the last 30 days.'
  },
  {
    id: 'insight-2',
    metric: 'Learning journeys active',
    value: 76,
    change: 12,
    description: 'Learners currently enrolled across bootcamps, apprenticeships, and CPD.'
  },
  {
    id: 'insight-3',
    metric: 'Employer briefs live',
    value: 24,
    change: 5,
    description: 'Active employer projects seeking collaborators this month.'
  }
];
