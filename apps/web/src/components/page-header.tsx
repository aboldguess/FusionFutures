/**
 * @file page-header.tsx
 * @description Mini README: Reusable header block for each page. Surfaces step-by-step guidance so end users never need to
 * read external documentation to understand actions.
 */

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
  checklist?: string[];
}

export function PageHeader({ title, description, actions, checklist }: PageHeaderProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-soft">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <p className="text-slate-300">{description}</p>
        </div>
        {actions && <div className="flex flex-col gap-3 md:items-end">{actions}</div>}
      </div>
      {checklist && (
        <ol className="mt-6 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
          {checklist.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand/30 text-xs font-bold text-white">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
