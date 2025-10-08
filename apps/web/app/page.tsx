/**
 * ============================================================================
 * File: apps/web/app/page.tsx
 * Purpose: Landing dashboard summarizing seeded demo data, health status, and guidance.
 * Structure: Uses shared UI components and module registry to render actionable cards.
 * Usage: Default route for authenticated and guest users, offering onboarding instructions.
 * ============================================================================
 */
import { Suspense } from "react";
import { HealthBadge, ModuleGrid, DebugConsoleHint } from "@fusion-futures/ui";
import { getCorrelationId } from "../lib/use-debug-logging";
import { DemoDataPanel } from "../components/demo-data-panel";

const HomePage = async () => {
  return (
    <main className="space-y-6">
      <section className="rounded-2xl border border-primary/40 bg-white p-6 shadow-lg dark:border-primary/60 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Welcome to Fusion Futures
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Use the navigation menu to explore modules. Follow the on-screen instructions and
              live hints for a smooth demo.
            </p>
          </div>
          <HealthBadge status="operational" correlationId={getCorrelationId()} />
        </div>
      </section>

      <DebugConsoleHint />

      <Suspense fallback={<p>Loading module overview…</p>}>
        <ModuleGrid />
      </Suspense>

      <Suspense fallback={<p>Preparing demo data…</p>}>
        <DemoDataPanel />
      </Suspense>
    </main>
  );
};

export default HomePage;
