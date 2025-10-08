"use client";
/**
 * ============================================================================
 * File: apps/web/components/demo-data-panel.tsx
 * Purpose: Display seeded demo data fetched from the FastAPI service.
 * Structure: Uses React Query for data fetching with retry, plus accessibility-first layout.
 * Usage: Embedded on the homepage to provide contextual data out of the box.
 * ============================================================================
 */
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Card } from "@fusion-futures/ui";
import type { DemoDataResponse } from "@fusion-futures/types";

const fetchDemoData = async (): Promise<DemoDataResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const response = await axios.get<DemoDataResponse>(`${baseUrl}/api/demo-data`, {
    headers: {
      "X-Debug-Client": "fusion-futures-web",
    },
    withCredentials: true,
  });
  return response.data;
};

export const DemoDataPanel = () => {
  const { data: session } = useSession();
  const { data, error, isLoading } = useQuery({
    queryKey: ["demo-data"],
    queryFn: fetchDemoData,
    retry: 1,
  });

  if (isLoading) {
    return <Card title="Loading demo records" subtitle="Hang tight while we synchronize." />;
  }

  if (error) {
    return (
      <Card
        intent="danger"
        title="Demo data temporarily unavailable"
        subtitle={(error as Error).message}
        actionLabel="View logs"
        onAction={() => window.open("/debugging", "_blank")}
      />
    );
  }

  return (
    <Card
      title="Seeded demo insights"
      subtitle={
        session?.user
          ? `Hello ${session.user.name ?? "admin"}, review the curated dataset below.`
          : "You are browsing in demo mode. Sign in to personalize results."
      }
    >
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {data.items?.map((item: { id: string; title: string; metric: string }) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-primary/70 focus-within:border-primary dark:border-slate-700 dark:bg-slate-900"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {item.title}
            </h3>
            <p className="text-2xl font-bold text-primary">{item.metric}</p>
            <p className="sr-only">Record identifier {item.id}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
