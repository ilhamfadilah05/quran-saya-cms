import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import {
  ADMIN_COOKIE,
  AdminSession,
  verifyAdminSessionToken,
} from './admin-session';
import { getServerEnv } from './env';

/** Sesi admin dari cookie (server component/route), atau null. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

/** Wajib login untuk halaman admin; redirect ke /login bila tidak. */
export async function requireAdminPageSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect('/login');
  return session;
}

/** Izinkan akses cron via sesi admin ATAU header/secret cron. */
export async function canAccessCronRoute(request: Request): Promise<boolean> {
  const session = await getAdminSession();
  if (session) return true;
  const env = getServerEnv();
  const url = new URL(request.url);
  const provided =
    request.headers.get('x-cron-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    url.searchParams.get('secret') ||
    '';
  if (!provided || !env.cronSecret) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(env.cronSecret);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
