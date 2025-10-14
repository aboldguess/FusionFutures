/**
 * @file auth-guard.tsx
 * @description Mini README: Client-side wrapper that prevents unauthenticated users from viewing protected routes. It
 * waits for the auth provider to bootstrap, then redirects to the login page with the original destination for a smooth
 * administrator experience.
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePlatformUser } from '@/hooks/use-platform-user';
import { logger } from '@/lib/logger';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { activeUser, bootstrapped } = usePlatformUser();
  const router = useRouter();
  const pathname = usePathname();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!bootstrapped) {
      return;
    }

    if (!activeUser) {
      setRedirecting(true);
      const next = pathname ? encodeURIComponent(pathname) : '%2F';
      logger.info('Unauthenticated access detected – redirecting to login', { attemptedPath: pathname });
      router.replace(`/login?next=${next}`);
      return;
    }

    setRedirecting(false);
  }, [activeUser, bootstrapped, pathname, router]);

  if (!bootstrapped || redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-200">
        Preparing your secure workspace…
      </div>
    );
  }

  return <>{children}</>;
}
