"use client";
/**
 * ============================================================================
 * File: packages/ui/src/components/card.tsx
 * Purpose: Shared card component with accessible headings, optional actions, and intents.
 * Structure: Functional component receiving title, subtitle, footer, and action callbacks.
 * Usage: Used across modules for consistent card layout and semantics.
 * ============================================================================
 */
import { ReactNode } from "react";
import clsx from "clsx";

type CardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  intent?: "neutral" | "success" | "danger";
  children?: ReactNode;
};

const intentClasses: Record<NonNullable<CardProps["intent"]>, string> = {
  neutral: "border-slate-200 dark:border-slate-700",
  success: "border-emerald-400 bg-emerald-50 dark:border-emerald-400/80 dark:bg-emerald-900/20",
  danger: "border-rose-400 bg-rose-50 dark:border-rose-400/80 dark:bg-rose-900/20",
};

export const Card = ({
  title,
  subtitle,
  footer,
  actionLabel,
  onAction,
  children,
  intent = "neutral",
}: CardProps) => (
  <article
    className={clsx(
      "rounded-2xl border bg-white p-6 shadow-sm transition dark:bg-slate-900",
      intentClasses[intent],
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
        ) : null}
      </div>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="rounded-md bg-secondary px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-secondary/90"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
    {children ? <div className="mt-4 text-sm text-slate-700 dark:text-slate-200">{children}</div> : null}
    {footer ? <footer className="mt-4 text-xs text-slate-500 dark:text-slate-400">{footer}</footer> : null}
  </article>
);
