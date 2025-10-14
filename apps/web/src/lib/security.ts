/**
 * @file security.ts
 * @description Mini README: Provides lightweight cryptographic helpers used client-side to hash secrets and keep demo
 * authentication flows realistic. Uses Web Crypto when available and falls back to Node's crypto module for SSR contexts.
 */

export async function hashSecret(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  const { createHash } = await import('crypto');
  return createHash('sha256').update(Buffer.from(data)).digest('hex');
}
