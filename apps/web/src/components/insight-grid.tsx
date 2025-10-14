/**
 * @file insight-grid.tsx
 * @description Mini README: Displays platform KPI cards summarising engagement metrics. Provides context text so users know
 * how to act on each figure.
 */

import { insights } from '@/data/insights';

export function InsightGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {insights.map((insight) => (
        <div key={insight.id} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-slate-400">{insight.metric}</p>
          <p className="mt-4 text-4xl font-semibold text-white">{insight.value}</p>
          <p className="mt-2 text-sm text-emerald-300">↑ {insight.change}% month-on-month</p>
          <p className="mt-4 text-sm text-slate-300">{insight.description}</p>
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand/40"
          >
            View contributing activity
          </button>
        </div>
      ))}
    </div>
  );
}
