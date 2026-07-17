import { getSupabaseServerClient } from './supabase';

// Segmentasi audiens untuk notifikasi bertarget.

export type SegmentFilter = {
  reminderOnly?: boolean; // hanya user yang mengaktifkan reminder
  platform?: string; // 'Android' | 'iOS'
  version?: string; // versi app tepat
  minLevel?: number; // learning_level >=
  minStreak?: number; // learning_streak >=
  inactiveDays?: number; // last_opened_at lebih lama dari N hari
  neverStarted?: boolean; // learning_lessons_done = 0
};

export type SegmentUser = { id: string; token_firebase: string };

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

/** Ambil user (id + token) yang cocok filter segmen. Selalu wajib punya token. */
export async function fetchSegmentUsers(
  filter: SegmentFilter
): Promise<SegmentUser[]> {
  const supabase = getSupabaseServerClient();
  let q = supabase
    .from('users')
    .select('id, token_firebase')
    .not('token_firebase', 'is', null)
    .neq('token_firebase', '');

  if (filter.reminderOnly) q = q.eq('is_reminder', true);
  if (filter.platform) q = q.eq('platform', filter.platform);
  if (filter.version) q = q.eq('version', filter.version);
  if (typeof filter.minLevel === 'number')
    q = q.gte('learning_level', filter.minLevel);
  if (typeof filter.minStreak === 'number')
    q = q.gte('learning_streak', filter.minStreak);
  if (filter.neverStarted) q = q.eq('learning_lessons_done', 0);
  if (typeof filter.inactiveDays === 'number')
    q = q.lte('last_opened_at', daysAgoIso(filter.inactiveDays));

  const { data, error } = await q.limit(20000);
  if (error) throw new Error(error.message);
  return (data ?? []) as SegmentUser[];
}

/** Ringkasan segmen jadi teks untuk log. */
export function describeSegment(filter: SegmentFilter): string {
  const parts: string[] = [];
  if (filter.reminderOnly) parts.push('reminder-on');
  if (filter.platform) parts.push(`platform=${filter.platform}`);
  if (filter.version) parts.push(`versi=${filter.version}`);
  if (filter.minLevel) parts.push(`level>=${filter.minLevel}`);
  if (filter.minStreak) parts.push(`streak>=${filter.minStreak}`);
  if (filter.neverStarted) parts.push('belum-mulai-belajar');
  if (filter.inactiveDays) parts.push(`vakum>=${filter.inactiveDays}h`);
  return parts.length ? parts.join(', ') : 'semua user bertoken';
}
