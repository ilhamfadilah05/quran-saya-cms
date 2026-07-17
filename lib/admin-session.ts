import crypto from 'crypto';
import { getServerEnv } from './env';

// Token sesi admin bergaya JWT (HMAC-SHA256), tanpa dependency berat.

export type AdminSession = {
  adminId: string;
  email: string;
  exp: number; // epoch detik
};

export const ADMIN_COOKIE = 'quran_saya_admin_session';

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function sign(payload: string, secret: string): string {
  return b64url(crypto.createHmac('sha256', secret).update(payload).digest());
}

export function createAdminSessionToken(
  session: Omit<AdminSession, 'exp'>,
  ttlSeconds = 60 * 60 * 24 * 7
): string {
  const env = getServerEnv();
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = b64url(JSON.stringify({ ...session, exp }));
  const sig = sign(body, env.adminSessionSecret);
  return `${body}.${sig}`;
}

export function verifyAdminSessionToken(token: string): AdminSession | null {
  try {
    const env = getServerEnv();
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const expected = sign(body, env.adminSessionSecret);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const session = JSON.parse(
      Buffer.from(
        body.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
      ).toString()
    ) as AdminSession;
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}
