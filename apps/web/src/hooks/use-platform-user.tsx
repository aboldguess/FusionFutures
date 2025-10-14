/**
 * @file use-platform-user.tsx
 * @description Mini README: Custom React hook managing the currently active user profile, including role switching and
 * simulated authentication state. The hook exposes helper methods to update the active role and retrieve mock data.
 * Structure: mock data import, context definition, provider component, convenience hook.
 */

'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { users } from '@/data/users';
import { logger } from '@/lib/logger';
import type { PlatformUser, UserRole } from '@/types/platform';

interface PlatformUserContextValue {
  activeUser: PlatformUser;
  switchRole: (role: UserRole) => void;
  availableUsers: PlatformUser[];
}

const PlatformUserContext = createContext<PlatformUserContextValue | undefined>(undefined);

export function PlatformUserProvider({ children }: { children: ReactNode }) {
  const [activeUser, setActiveUser] = useState<PlatformUser>(users[0]);

  const value = useMemo<PlatformUserContextValue>(() => ({
    activeUser,
    switchRole: (role: UserRole) => {
      const match = users.find((user) => user.role === role) ?? users[0];
      logger.info(`Switching to ${role} role`, { previous: activeUser.role });
      setActiveUser(match);
    },
    availableUsers: users
  }), [activeUser]);

  return <PlatformUserContext.Provider value={value}>{children}</PlatformUserContext.Provider>;
}

export function usePlatformUser() {
  const context = useContext(PlatformUserContext);

  if (!context) {
    throw new Error('usePlatformUser must be used within a PlatformUserProvider');
  }

  return context;
}
