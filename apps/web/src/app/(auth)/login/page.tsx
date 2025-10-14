/**
 * @file login/page.tsx
 * @description Mini README: Server component wrapper for the login experience. Delegates to the client-side panel so we
 * can access hooks while still parsing query parameters server-side.
 */

import { LoginPanel } from '@/components/auth/login-panel';

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
    message?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return <LoginPanel redirectPath={params?.next} message={params?.message} />;
}
