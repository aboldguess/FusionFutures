"use client";
/**
 * ============================================================================
 * File: packages/ui/src/module-registry.tsx
 * Purpose: Central registry describing modules available in the platform.
 * Structure: Exports metadata, along with grid and summary components that render cards.
 * Usage: Consumed by Next.js app for navigation and onboarding guidance.
 * ============================================================================
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "./components/card";

export type ModuleDefinition = {
  id: string;
  title: string;
  description: string;
  href: string;
  tasks: string[];
};

export const moduleRegistry: ModuleDefinition[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Aggregated health, KPIs, and debugging entry points.",
    href: "/(modules)/dashboard",
    tasks: ["Review KPIs", "Check alerting", "Validate audit logs"],
  },
  {
    id: "admin",
    title: "Admin",
    description: "Manage users, permissions, and subscription status.",
    href: "/(modules)/admin",
    tasks: ["Approve roles", "Rotate API keys", "Review audit log"],
  },
];

export const ModuleGrid = () => {
  const router = useRouter();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {moduleRegistry.map((module) => (
        <Card
          key={module.id}
          title={module.title}
          subtitle={module.description}
          actionLabel="Open module"
          onAction={() => router.push(module.href)}
          footer={`Top tasks: ${module.tasks.join(" • ")}`}
        />
      ))}
    </div>
  );
};

export const ModuleSummary = ({ moduleId }: { moduleId: string }) => {
  const module = moduleRegistry.find((entry) => entry.id === moduleId);
  if (!module) {
    return <p className="text-sm text-rose-500">Module metadata missing.</p>;
  }
  return (
    <Card
      title={`${module.title} quick start`}
      subtitle={module.description}
      footer={`Recommended steps: ${module.tasks.join(" → ")}`}
    >
      <p>
        Ready to get started? Follow the ordered steps below and jump into the module with the button. Need help?
        Jump to the debugging console or ping #support.
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-6 text-sm">
        {module.tasks.map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ol>
      <Link
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-secondary/90"
        href={module.href}
      >
        Visit {module.title}
      </Link>
    </Card>
  );
};
