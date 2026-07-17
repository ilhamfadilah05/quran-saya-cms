import { getSupabaseServerClient } from './supabase';
import { sendPushNotification, adzanSoundDetails } from './fcm';
import { getServerEnv } from './env';

export type CronJobResult = {
  ok: boolean;
  job: 'adzan' | 'reminder' | 'winback';
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
  time: string;
  timeZone: string;
  message?: string;
};

function getNowParts(timeZone: string) {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA', { timeZone }); // YYYY-MM-DD
  const hhmm = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  });
  return { date, hhmm };
}

function addCalendarDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

type PreparedItem = {
  dedupeKey: string;
  userId: string | null;
  token: string;
  title: string;
  body: string;
  sourceType: string;
  category: string;
  scheduledTime?: string;
  metadata?: Record<string, unknown>;
  data?: Record<string, string>;
  sound?: { androidChannelId?: string; androidSound?: string; iosSound?: string };
};

/** Kirim sekumpulan notifikasi dengan dedupe + log ke notification_logs. */
async function dispatch(
  items: PreparedItem[]
): Promise<{ processed: number; sent: number; failed: number; skipped: number }> {
  const supabase = getSupabaseServerClient();
  if (items.length === 0)
    return { processed: 0, sent: 0, failed: 0, skipped: 0 };

  const keys = items.map((i) => i.dedupeKey);
  const { data: existingRows, error: exErr } = await supabase
    .from('notification_logs')
    .select('id, dedupe_key, status')
    .in('dedupe_key', keys);
  if (exErr) throw new Error(exErr.message);

  const existing = new Map(
    (existingRows ?? []).map((r) => [
      r.dedupe_key as string,
      { id: r.id as number, status: r.status as string },
    ])
  );

  const newItems = items.filter((i) => !existing.has(i.dedupeKey));
  const retryItems = items.filter((i) => {
    const e = existing.get(i.dedupeKey);
    return e && (e.status === 'failed' || e.status === 'queued');
  });
  const skipped = items.length - newItems.length - retryItems.length;

  let inserted: { id: number; dedupe_key: string }[] = [];
  if (newItems.length > 0) {
    const { data, error } = await supabase
      .from('notification_logs')
      .insert(
        newItems.map((i) => ({
          user_id: i.userId,
          source_type: i.sourceType,
          category: i.category,
          title: i.title,
          body: i.body,
          status: 'queued',
          scheduled_time: i.scheduledTime ?? null,
          dedupe_key: i.dedupeKey,
          metadata: i.metadata ?? {},
        }))
      )
      .select('id, dedupe_key');
    if (error) throw new Error(error.message);
    inserted = (data ?? []) as { id: number; dedupe_key: string }[];
  }

  const retryIds = retryItems
    .map((i) => existing.get(i.dedupeKey)?.id)
    .filter((v): v is number => typeof v === 'number');
  if (retryIds.length > 0) {
    await supabase
      .from('notification_logs')
      .update({ status: 'queued', error_message: null })
      .in('id', retryIds);
  }

  const toSend: { logId: number; item: PreparedItem }[] = [
    ...inserted.map((row) => ({
      logId: row.id,
      item: items.find((i) => i.dedupeKey === row.dedupe_key)!,
    })),
    ...retryItems.map((i) => ({
      logId: existing.get(i.dedupeKey)!.id,
      item: i,
    })),
  ].filter((x) => x.item);

  let sent = 0;
  let failed = 0;
  for (const { logId, item } of toSend) {
    const result = await sendPushNotification({
      tokens: [item.token],
      title: item.title,
      body: item.body,
      data: {
        type: item.sourceType,
        category: item.category,
        ...(item.data ?? {}),
      },
      androidChannelId: item.sound?.androidChannelId,
      androidSound: item.sound?.androidSound,
      iosSound: item.sound?.iosSound,
    });
    const first = result.results[0];
    if (first?.ok) {
      sent += 1;
      await supabase
        .from('notification_logs')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('id', logId);
    } else {
      failed += 1;
      await supabase
        .from('notification_logs')
        .update({ status: 'failed', error_message: first?.error ?? 'Unknown error' })
        .eq('id', logId);
    }
  }

  return { processed: toSend.length, sent, failed, skipped };
}

// ── Adzan ──

type AdzanRow = {
  user_id: string | null;
  city_name: string | null;
  is_subuh: boolean | null;
  is_dzuhur: boolean | null;
  is_ashar: boolean | null;
  is_maghrib: boolean | null;
  is_isya: boolean | null;
  subuh_time: string | null;
  dzuhur_time: string | null;
  ashar_time: string | null;
  maghrib_time: string | null;
  isya_time: string | null;
};

function pickPrayer(row: AdzanRow, hhmm: string) {
  if (row.is_subuh && row.subuh_time === hhmm) return { key: 'subuh', label: 'Subuh' };
  if (row.is_dzuhur && row.dzuhur_time === hhmm) return { key: 'dzuhur', label: 'Dzuhur' };
  if (row.is_ashar && row.ashar_time === hhmm) return { key: 'ashar', label: 'Ashar' };
  if (row.is_maghrib && row.maghrib_time === hhmm)
    return { key: 'maghrib', label: 'Maghrib' };
  if (row.is_isya && row.isya_time === hhmm) return { key: 'isya', label: 'Isya' };
  return null;
}

export async function runAdzanCron(): Promise<CronJobResult> {
  const supabase = getSupabaseServerClient();
  const timeZone = getServerEnv().appTimezone;
  const { date, hhmm } = getNowParts(timeZone);

  const { data: rows, error } = await supabase
    .from('adzan_notification')
    .select(
      'user_id, city_name, is_subuh, is_dzuhur, is_ashar, is_maghrib, is_isya, subuh_time, dzuhur_time, ashar_time, maghrib_time, isya_time'
    );
  if (error) throw new Error(error.message);

  const matches: {
    userId: string;
    prayer: { key: string; label: string };
    city: string | null;
  }[] = [];
  for (const r of (rows ?? []) as AdzanRow[]) {
    if (!r.user_id) continue;
    const p = pickPrayer(r, hhmm);
    if (p) matches.push({ userId: r.user_id, prayer: p, city: r.city_name });
  }

  if (matches.length === 0) {
    return {
      ok: true,
      job: 'adzan',
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      time: hhmm,
      timeZone,
      message: 'No schedule',
    };
  }

  const ids = [...new Set(matches.map((m) => m.userId))];
  const { data: users } = await supabase
    .from('users')
    .select('id, token_firebase')
    .in('id', ids)
    .not('token_firebase', 'is', null)
    .neq('token_firebase', '');
  const tokenOf = new Map(
    (users ?? []).map((u) => [u.id as string, u.token_firebase as string])
  );

  const sound = adzanSoundDetails();
  const items: PreparedItem[] = [];
  for (const m of matches) {
    const token = tokenOf.get(m.userId);
    if (!token) continue;
    items.push({
      dedupeKey: `adzan:${date}:${hhmm}:${m.prayer.key}:${m.userId}`,
      userId: m.userId,
      token,
      title: `Waktu ${m.prayer.label}`,
      body: `Telah masuk waktu sholat ${m.prayer.label} (${hhmm})`,
      sourceType: 'adzan',
      category: m.prayer.key,
      scheduledTime: hhmm,
      metadata: { prayer_key: m.prayer.key, city: m.city, date },
      sound,
    });
  }

  const res = await dispatch(items);
  return { ok: true, job: 'adzan', ...res, time: hhmm, timeZone };
}

// ── Reminder terjadwal ──

export async function runReminderCron(): Promise<CronJobResult> {
  const supabase = getSupabaseServerClient();
  const timeZone = getServerEnv().appTimezone;
  const { date, hhmm } = getNowParts(timeZone);

  const { data: reminders, error } = await supabase
    .from('custom_reminders')
    .select('id, title, body')
    .eq('is_active', true)
    .eq('schedule_time', hhmm)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);

  if (!reminders || reminders.length === 0) {
    return {
      ok: true,
      job: 'reminder',
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      time: hhmm,
      timeZone,
      message: 'No reminder',
    };
  }

  const { data: users } = await supabase
    .from('users')
    .select('id, token_firebase')
    .eq('is_reminder', true)
    .not('token_firebase', 'is', null)
    .neq('token_firebase', '');
  const recipients = (users ?? []) as { id: string; token_firebase: string }[];

  const items: PreparedItem[] = [];
  for (const rem of reminders) {
    for (const u of recipients) {
      items.push({
        dedupeKey: `reminder:${date}:${hhmm}:${rem.id}:${u.id}`,
        userId: u.id,
        token: u.token_firebase,
        title: rem.title as string,
        body: rem.body as string,
        sourceType: 'reminder',
        category: 'custom_reminder',
        scheduledTime: hhmm,
        metadata: { reminder_id: rem.id, date },
      });
    }
  }

  const res = await dispatch(items);
  return { ok: true, job: 'reminder', ...res, time: hhmm, timeZone };
}

// ── Win-back (re-engagement berbasis data belajar) ──

type WinbackSegment = 'streak_at_risk' | 'inactive_learner' | 'never_started';

const WINBACK_MESSAGES: Record<WinbackSegment, { title: string; body: string }> = {
  streak_at_risk: {
    title: 'Streak-mu hampir putus! 🔥',
    body: 'Sempatkan 1 menit Latihan Kilat malam ini biar istiqomahmu tetap nyala.',
  },
  inactive_learner: {
    title: 'Si Pelita kangen 🪔',
    body: 'Yuk lanjut belajar ngaji — cuma 1 menit kok. Bismillah!',
  },
  never_started: {
    title: 'Coba Latihan Kilat ✨',
    body: 'Belajar baca Al-Qur’an seru ala game. 1 menit pertamamu menanti!',
  },
};

type WinbackUser = {
  id: string;
  token_firebase: string;
  created_at: string | null;
  learning_streak: number | null;
  learning_lessons_done: number | null;
  learning_last_active_at: string | null;
};

function classifyWinback(
  u: WinbackUser,
  o: { yesterday: string; inactiveCutoff: string; signupCutoff: string }
): WinbackSegment | null {
  const lastActive = u.learning_last_active_at
    ? u.learning_last_active_at.slice(0, 10)
    : null;
  const streak = u.learning_streak ?? 0;
  const done = u.learning_lessons_done ?? 0;
  const created = u.created_at ? u.created_at.slice(0, 10) : null;
  if (streak >= 3 && lastActive === o.yesterday) return 'streak_at_risk';
  if (done > 0 && lastActive !== null && lastActive <= o.inactiveCutoff)
    return 'inactive_learner';
  if (done === 0 && created !== null && created <= o.signupCutoff)
    return 'never_started';
  return null;
}

export async function runWinbackCron(
  opts: { force?: boolean } = {}
): Promise<CronJobResult> {
  const supabase = getSupabaseServerClient();
  const env = getServerEnv();
  const timeZone = env.appTimezone;
  const { date, hhmm } = getNowParts(timeZone);

  if (!opts.force && hhmm !== env.winbackTime) {
    return {
      ok: true,
      job: 'winback',
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      time: hhmm,
      timeZone,
      message: `skip (bukan ${env.winbackTime})`,
    };
  }

  const { data: rows, error } = await supabase
    .from('users')
    .select(
      'id, token_firebase, created_at, learning_streak, learning_lessons_done, learning_last_active_at'
    )
    .eq('is_reminder', true)
    .not('token_firebase', 'is', null)
    .neq('token_firebase', '');
  if (error) throw new Error(error.message);

  const cutoffs = {
    yesterday: addCalendarDays(date, -1),
    inactiveCutoff: addCalendarDays(date, -3),
    signupCutoff: addCalendarDays(date, -2),
  };

  const items: PreparedItem[] = [];
  for (const u of (rows ?? []) as WinbackUser[]) {
    const seg = classifyWinback(u, cutoffs);
    if (!seg) continue;
    const msg = WINBACK_MESSAGES[seg];
    items.push({
      dedupeKey: `winback:${date}:${u.id}`,
      userId: u.id,
      token: u.token_firebase,
      title: msg.title,
      body: msg.body,
      sourceType: 'winback',
      category: seg,
      scheduledTime: hhmm,
      metadata: { segment: seg, date },
    });
  }

  const res = await dispatch(items);
  return { ok: true, job: 'winback', ...res, time: hhmm, timeZone };
}

