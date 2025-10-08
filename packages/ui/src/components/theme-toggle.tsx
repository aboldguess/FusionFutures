"use client";
/**
 * ============================================================================
 * File: packages/ui/src/components/theme-toggle.tsx
 * Purpose: Toggle component for switching between light and dark mode.
 * Structure: Uses next-themes hook to update the document class list.
 * Usage: Rendered in the navigation shell for quick theme switching.
 * ============================================================================
 */
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span className="inline-flex h-9 w-9 animate-pulse items-center justify-center rounded-full bg-slate-200" aria-hidden>
        …
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
};
