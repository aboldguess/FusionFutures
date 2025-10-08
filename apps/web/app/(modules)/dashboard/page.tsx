/**
 * ============================================================================
 * File: apps/web/app/(modules)/dashboard/page.tsx
 * Purpose: Provide the main analytics dashboard experience with usage instructions.
 * Structure: Renders cards sourced from the module registry along with debugging helpers.
 * Usage: Accessed via the Dashboard nav entry; demonstrates route grouping.
 * ============================================================================
 */
import { ModuleSummary } from "@fusion-futures/ui";
import Link from "next/link";

const DashboardModulePage = () => (
  <section className="space-y-4">
    <header className="rounded-xl border border-secondary/40 bg-white p-6 shadow-sm dark:border-secondary/50 dark:bg-slate-900">
      <h2 className="text-2xl font-semibold text-secondary">Analytics Overview</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Review quick metrics, then expand into module-specific pages. Hover any card to reveal debugging tips.
      </p>
    </header>
    <ModuleSummary moduleId="dashboard" />
    <p className="text-sm text-slate-500 dark:text-slate-400">
      Need assistance? Visit the <Link href="/debugging" className="underline">debugging console</Link> for live hints and log navigation.
    </p>
  </section>
);

export default DashboardModulePage;
