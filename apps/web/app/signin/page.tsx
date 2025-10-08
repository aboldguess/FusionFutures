"use client";
/**
 * ============================================================================
 * File: apps/web/app/signin/page.tsx
 * Purpose: Provide the credentials-based sign-in form with clear instructions.
 * Structure: Uses shared Card component and handles Auth.js sign-in.
 * Usage: Auth.js signIn page mapped via auth options.
 * ============================================================================
 */
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@fusion-futures/ui";

const SignInPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push("/");
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center">
      <Card
        title="Sign in to Fusion Futures"
        subtitle="Use the demo credentials shown below or your seeded account."
        footer="Demo: admin@fusionfutures.dev / adminpass"
      >
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email address
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Password
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Access dashboard
          </button>
        </form>
      </Card>
    </main>
  );
};

export default SignInPage;
