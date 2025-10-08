"use client";
/**
 * ============================================================================
 * File: apps/web/components/admin-task-list.tsx
 * Purpose: Render actionable administrative tasks with inline debugging hints.
 * Structure: Iterates over tasks, using shared Card component for consistent UI.
 * Usage: Displayed on admin module page; encourages secure, auditable workflows.
 * ============================================================================
 */
import { Card } from "@fusion-futures/ui";

const ADMIN_TASKS = [
  {
    id: "manage-profiles",
    title: "Manage Profiles",
    description: "Review profile completeness, trigger MFA enrollment, and verify audit logs.",
    hint: "If syncing stalls, check /api/audit/logs and ensure the request ID matches console output.",
  },
  {
    id: "learning-zone",
    title: "Learning Zone",
    description: "Assign new training modules and confirm participants received confirmation emails.",
    hint: "Look for pub/sub events labelled 'training.assigned' in the backend logs if emails are missing.",
  },
  {
    id: "subscription",
    title: "Subscription Details",
    description: "Validate plan entitlements, update billing contacts, and export invoices.",
    hint: "Cross-check the Stripe webhook events table via the API explorer before finalizing changes.",
  },
];

export const AdminTaskList = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {ADMIN_TASKS.map((task) => (
      <Card key={task.id} title={task.title} subtitle={task.description} footer={task.hint} />
    ))}
  </div>
);
