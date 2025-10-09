"use client";
/**
 * ============================================================================
 * File: packages/ui/src/components/debug-console-hint.tsx
 * Purpose: Provide inline instructions guiding users through debugging workflows.
 * Structure: Accessible alert-style banner with direct call-to-action links.
 * Usage: Rendered on the homepage and relevant modules for quick troubleshooting.
 * ============================================================================
 */
import Link from "next/link";

export const DebugConsoleHint = () => (
  <aside
    className="debug-banner flex flex-col gap-1 rounded-xl"
    role="alert"
    aria-live="polite"
  >
    <strong className="text-sm">Debugging quick start</strong>
    <p>
      Open <Link href="/debugging" className="underline">Debug Console</Link> to copy the current correlation ID. Run
      <code className="mx-1 rounded bg-slate-200 px-1 py-0.5 text-[0.7rem] text-slate-800">
        docker compose -f infra/docker/docker-compose.yml --project-name fusion_futures logs -f --tail=200
      </code>
      in your terminal to stream structured logs with this ID highlighted.
    </p>
    <p>
      Tip: Toggle dark mode for better contrast during overnight support rotations.
    </p>
  </aside>
);
