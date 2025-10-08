/**
 * ============================================================================
 * File: apps/web/app/(modules)/admin/page.tsx
 * Purpose: Admin workflow UI demonstrating role-based hints and actionable tasks.
 * Structure: Uses shared cards and lists to communicate responsibilities.
 * Usage: Accessible to admin role; contains inline instructions and CTA buttons.
 * ============================================================================
 */
import { AdminTaskList } from "../../components/admin-task-list";

const AdminModulePage = () => (
  <section className="space-y-6">
    <header className="rounded-xl border border-primary/50 bg-white p-6 shadow-lg dark:border-primary/70 dark:bg-slate-900">
      <h2 className="text-2xl font-bold text-primary">Administrator Operations Center</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Review the checklist below to manage users, audit logs, and subscription statuses. Each task includes the
        exact debugging steps if issues arise.
      </p>
    </header>
    <AdminTaskList />
  </section>
);

export default AdminModulePage;
