/**
 * @file login-panel.tsx
 * @description Mini README: Client-side login panel handling credential submission, error messaging, and invite-code
 * shortcuts. Built for administrators with clear instructions and debug logging.
 */

'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatformUser } from '@/hooks/use-platform-user';
import { logger } from '@/lib/logger';

interface LoginPanelProps {
  redirectPath?: string;
  message?: string;
}

export function LoginPanel({ redirectPath = '/', message }: LoginPanelProps) {
  const router = useRouter();
  const { login, activeUser } = usePlatformUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(message ?? null);
  const [isSubmitting, setSubmitting] = useState(false);

  if (activeUser) {
    router.replace(redirectPath || '/');
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message ?? 'Unable to sign in. Try again.');
      setSubmitting(false);
      return;
    }

    logger.info('Login successful – redirecting user', {
      redirectPath,
      email
    });

    router.replace(redirectPath || '/');
  };

  const handleInviteSubmit = () => {
    if (!inviteCode.trim()) {
      setError('Enter an invitation code to continue.');
      return;
    }

    setToast('Opening your personalised signup form…');
    router.push(`/invite/${inviteCode.trim()}`);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-sm text-slate-200">
        <h2 className="text-lg font-semibold text-white">Login</h2>
        <p className="mt-2 text-xs text-slate-300">
          Use your Fusion Futures credentials. Passwords are hashed client-side to simulate a production-grade flow.
        </p>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-xs uppercase text-slate-400">
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
              placeholder="you@fusionfutures.example"
              autoComplete="email"
            />
          </label>
          <label className="block text-xs uppercase text-slate-400">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
              placeholder="Enter your secure password"
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-slate-400">
          <li>Superadmin demo: amina.clarke@fusionfutures.example / FusionSuperadmin!1</li>
          <li>Admin demo: jonah.reid@fusionfutures.example / FusionAdmin!1</li>
          <li>User demo: ellie.morgan@fusionfutures.example / FusionUser!1</li>
        </ul>
      </section>
      <section className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm text-slate-200">
        <h2 className="text-lg font-semibold text-white">Have an invitation code?</h2>
        <p className="mt-2 text-xs text-slate-300">Paste it below to start onboarding with your pre-assigned role.</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            className="flex-1 rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white focus:border-brand focus:outline-none"
            placeholder="FF-USER-TRIAL-001"
          />
          <button
            type="button"
            onClick={handleInviteSubmit}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Redeem invitation
          </button>
        </div>
      </section>
      {toast && <p className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs text-emerald-200">{toast}</p>}
      {error && <p className="rounded-full bg-rose-500/20 px-4 py-2 text-xs text-rose-200">{error}</p>}
    </div>
  );
}
