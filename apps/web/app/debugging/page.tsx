/**
 * ============================================================================
 * File: apps/web/app/debugging/page.tsx
 * Purpose: Provide real-time debugging and logging guidance for operators.
 * Structure: Combines instructions, log streaming hints, and correlation ID copy utility.
 * Usage: Linked from multiple UI surfaces when troubleshooting is required.
 * ============================================================================
 */
import { getCorrelationId } from "../../lib/use-debug-logging";

const DebuggingPage = () => {
  const correlationId = getCorrelationId();
  return (
    <section className="space-y-4">
      <header className="debug-banner" role="note" aria-label="Debug console instructions">
        <p>
          Copy the correlation ID below into the FastAPI logs to trace activity end-to-end. Run
          <code>docker compose -f infra/docker/docker-compose.yml --project-name fusion_futures logs -f --tail=200</code> to tail
          the combined stream with highlighting.
        </p>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Current Correlation ID</h2>
        <code className="mt-2 inline-flex items-center rounded bg-slate-100 px-2 py-1 font-mono text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100">
          {correlationId}
        </code>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          When reporting an issue, include this ID plus a screenshot of the module you were using. Logs are stored securely with
          retention policies in infra/docker/backups.
        </p>
      </div>
    </section>
  );
};

export default DebuggingPage;
