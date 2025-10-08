"use client";
/**
 * ============================================================================
 * File: packages/ui/src/components/health-badge.tsx
 * Purpose: Display service health status with accessible color coding.
 * Structure: Accepts status and correlation ID, rendering a descriptive badge.
 * Usage: Placed on dashboards and troubleshooting panels.
 * ============================================================================
 */
import clsx from "clsx";

type HealthBadgeProps = {
  status: "operational" | "degraded" | "outage";
  correlationId: string;
};

const statusStyles: Record<HealthBadgeProps["status"], { container: string; dot: string; label: string }> = {
  operational: {
    container: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    dot: "bg-emerald-500",
    label: "All systems operational",
  },
  degraded: {
    container: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    dot: "bg-amber-500",
    label: "Performance degraded",
  },
  outage: {
    container: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
    dot: "bg-rose-500",
    label: "Partial outage detected",
  },
};

export const HealthBadge = ({ status, correlationId }: HealthBadgeProps) => (
  <div className={clsx("rounded-full px-4 py-2 text-sm font-semibold", statusStyles[status].container)} role="status">
    <span
      className={clsx("mr-2 inline-flex h-2.5 w-2.5 rounded-full align-middle shadow-sm", statusStyles[status].dot)}
      aria-hidden
    />
    {statusStyles[status].label}
    <span className="ml-3 text-xs opacity-75">CorrID: {correlationId}</span>
  </div>
);
