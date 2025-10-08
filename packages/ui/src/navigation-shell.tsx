"use client";
/**
 * ============================================================================
 * File: packages/ui/src/navigation-shell.tsx
 * Purpose: Provide the primary layout including header, navigation, and profile menu.
 * Structure: Renders top navigation with module-driven links and Auth.js aware user menu.
 * Usage: Consumed by the Next.js root layout to wrap all pages consistently.
 * ============================================================================
 */
import { PropsWithChildren, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { moduleRegistry } from "./module-registry";
import { ThemeToggle } from "./components/theme-toggle";

export const NavigationShell = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <nav aria-label="Primary" className="flex items-center gap-4">
            <Link href="/" className="text-lg font-semibold text-primary">
              Fusion Futures
            </Link>
            <ul className="hidden items-center gap-2 md:flex">
              {moduleRegistry.map((module) => (
                <li key={module.id}>
                  <Link
                    href={module.href}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                      pathname === module.href
                        ? "bg-primary text-primary-foreground"
                        : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    {module.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="relative">
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="hidden text-left md:block">
                  {session?.user?.name ?? "Guest"}
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {session?.user?.role ?? "demo"}
                  </span>
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
                </span>
              </button>
              {menuOpen ? (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-lg border border-slate-200 bg-white p-2 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-900"
                  role="menu"
                >
                  {[
                    { label: "Manage Profiles", href: "/profiles" },
                    { label: "Learning Zone", href: "/learning" },
                    { label: "My Details", href: "/account" },
                    { label: "Subscription Details", href: "/subscription" },
                    { label: "Manage Users", href: "/users" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-slate-200 dark:hover:bg-slate-800"
                      role="menuitem"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="mt-2 w-full rounded-md bg-red-500 px-3 py-2 text-left font-semibold text-white hover:bg-red-600"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
};
