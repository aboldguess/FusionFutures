/**
 * @file providers.tsx
 * @description Mini README: Aggregates global React providers such as the theme manager, React Query client,
 * and debug logger context. This component ensures that cross-cutting concerns are initialised once at the root.
 * Structure: imports, logger initialisation, QueryClientProvider, ThemeProvider, PlatformUserProvider, and children rendering.
 */

'use client';

import { ReactNode, useMemo } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { logger } from '@/lib/logger';
import { PlatformUserProvider } from '@/hooks/use-platform-user';
import { ImpactFeedProvider } from '@/hooks/use-impact-feed';
import { EventsProvider } from '@/hooks/use-events';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const client = useMemo(() => new QueryClient(), []);

  logger.info('Providers mounted – global contexts ready.');

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={client}>
        <PlatformUserProvider>
          <EventsProvider>
            <ImpactFeedProvider>{children}</ImpactFeedProvider>
          </EventsProvider>
        </PlatformUserProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
