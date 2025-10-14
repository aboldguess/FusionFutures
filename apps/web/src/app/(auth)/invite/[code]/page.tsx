/**
 * @file invite/[code]/page.tsx
 * @description Mini README: Server component wrapper for the invitation redemption flow. Decodes the invitation code and
 * passes it to the client-side signup panel.
 */

import { InviteSignupPanel } from '@/components/auth/invite-signup-panel';

interface InvitePageProps {
  params: {
    code: string;
  };
}

export default function InvitePage({ params }: InvitePageProps) {
  return <InviteSignupPanel code={decodeURIComponent(params.code)} />;
}
