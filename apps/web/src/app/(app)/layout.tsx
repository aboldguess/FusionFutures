/**
 * @file (app)/layout.tsx
 * @description Mini README: Layout for authenticated pages. Wraps content with the AuthGuard and NavigationChrome so only
 * verified users can access the primary workspace.
 */

import { ReactNode } from 'react';
import { NavigationChrome } from '@/components/navigation-chrome';
import { AuthGuard } from '@/components/auth-guard';

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <NavigationChrome>{children}</NavigationChrome>
    </AuthGuard>
  );
}
