import { getSupabaseServerClient } from '@/lib/supabase';
import { sendPushNotification } from '@/lib/fcm';

export type CronJobResult = {
  ok: boolean;
  job: 'adzan' | 'reminder' | 'winback';
  processed: number;
  sent: number;
  failed: number;
  time: string;
  timeZone: string;
  message?: string;
  breakdown?: {
    activeReminders: number;
    eligibleUsers: number;
    prepared: number;
    insertedNew: number;
    retried: number;
    skippedDuplicate: number;
  };
};

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

type ReminderRow = {
  id: string;
  title: string;
  body: string;
};

function getNowParts(timeZone: string) {
  const now = new Date();
  const date = now.toLocaleDateString('en-CA', { timeZone });
  const hhmm = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone
  });

  return { date, hhmm };
}

function pickPrayer(row: AdzanRow, hhmm: string) {
  if (row.is_subuh && row.subuh_time === hhmm) return { key: 'subuh', label: 'Subuh' };
  if (row.is_dzuhur && row.dzuhur_time === hhmm) return { key: 'dzuhur', label: 'Dzuhur' };
  if (row.is_ashar && row.ashar_time === hhmm) return { key: 'ashar', label: 'Ashar' };
  if (row.is_maghrib && row.maghrib_time === hhmm) return { key: 'maghrib', label: 'Maghrib' };
  if (row.is_isya && row.isya_time === hhmm) return { key: 'isya', label: 'Isya' };
  return null;
}

export async function runAdzanCron(): Promise<CronJobResult> {
  const supabase = getSupabaseServerClient();
  const timeZone = process.env.APP_TIMEZONE ?? 'Asia/Jakarta';
  const adzanChannelId = process.env.ADZAN_ANDROID_CHANNEL_ID ?? 'adzan_channel';
  const adzanAndroidSound = process.env.ADZAN_ANDROID_SOUND ?? 'adzan';
  const adzanApnsSound = process.env.ADZAN_APNS_SOUND ?? 'adzan.caf';
  const { date, hhmm } = getNowParts(timeZone);

  const orClause = [
    `and(is_subuh.eq.true,subuh_time.eq.${hhmm})`,
    `and(is_dzuhur.eq.true,dzuhur_time.eq.${hhmm})`,
    `and(is_ashar.eq.true,ashar_time.eq.${hhmm})`,
    `and(is_maghrib.eq.true,maghrib_time.eq.${hhmm})`,
    `and(is_isya.eq.true,isya_time.eq.${hhmm})`
  ].join(',');

  const { data: adzanRows, error: adzanError } = await supabase
    .from('adzan_notification')
    .select(
      'user_id, city_name, is_subuh, is_dzuhur, is_ashar, is_maghrib, is_isya, subuh_time, dzuhur_time, ashar_time, maghrib_time, isya_time'
    )
    .or(orClause);

  if (adzanError) {
    throw new Error(adzanError.message);
  }

  const rows = (adzanRows ?? []) as AdzanRow[];
  if (rows.length === 0) {
    return { ok: true, job: 'adzan', processed: 0, sent: 0, failed: 0, time: hhmm, timeZone, message: 'No schedule' };
  }

  const userIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))] as string[];
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, token_firebase')
    .in('id', userIds)
    .not('token_firebase', 'is', null)
    .neq('token_firebase', '');

  if (userError) {
    throw new Error(userError.message);
  }

  const userTokenMap = new Map((users ?? []).map((user) => [user.id as string, user.token_firebase as string]));

  const prepared = rows
    .map((row) => {
      if (!row.user_id) return null;
      const token = userTokenMap.get(row.user_id);
      if (!token) return null;

      const prayer = pickPrayer(row, hhmm);
      if (!prayer) return null;

      const city = row.city_name ?? 'kota Anda';
      const title = `Waktu Adzan ${prayer.label}`;
      const body = `Sudah masuk waktu ${prayer.label} di ${city}. Yuk tunaikan sholat.`;
      const dedupeKey = `adzan:${date}:${hhmm}:${row.user_id}:${prayer.key}`;

      return {
        dedupeKey,
        userId: row.user_id,
        token,
        title,
        body,
        prayerKey: prayer.key,
        city
      };
    })
    .filter(Boolean) as Array<{
      dedupeKey: string;
      userId: string;
      token: string;
      title: string;
      body: string;
      prayerKey: string;
      city: string;
    }>;

  if (prepared.length === 0) {

    return { ok: true, job: 'adzan', processed: rows.length, sent: 0, failed: 0, time: hhmm, timeZone, message: 'No eligible users' };
  }

  const insertRows = prepared.map((item) => ({
    user_id: item.userId,
    source_type: 'adzan',
    category: item.prayerKey,
    title: item.title,
    body: item.body,
    status: 'queued',
    scheduled_time: hhmm,
    dedupe_key: item.dedupeKey,
    metadata: {
      prayer_key: item.prayerKey,
      city: item.city,
      date,
      time: hhmm
    }
  }));

  const { data: queuedRows, error: queueError } = await supabase
    .from('notification_logs')
    .upsert(insertRows, { onConflict: 'dedupe_key', ignoreDuplicates: true })
    .select('id, dedupe_key');

  if (queueError) {
    throw new Error(queueError.message);
  }

  const queued = queuedRows ?? [];
  let sent = 0;
  let failed = 0;

  for (const row of queued) {
    const payload = prepared.find((item) => item.dedupeKey === (row.dedupe_key as string));
    if (!payload) continue;

    const result = await sendPushNotification({
      tokens: [payload.token],
      title: payload.title,
      body: payload.body,
      androidChannelId: adzanChannelId,
      androidSound: adzanAndroidSound,
      apnsSound: adzanApnsSound,
      data: {
        type: 'adzan',
        prayer_key: payload.prayerKey,
        city: payload.city,
        scheduled_time: hhmm
      }
    });

    const first = result.results[0];
    if (first?.ok) {
      sent += 1;
      await supabase
        .from('notification_logs')
        .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
        .eq('id', row.id);
    } else {
      failed += 1;
      await supabase
        .from('notification_logs')
        .update({ status: 'failed', error_message: first?.error ?? 'Unknown error' })
        .eq('id', row.id);
    }
  }

  return { ok: true, job: 'adzan', processed: queued.length, sent, failed, time: hhmm, timeZone };
}

export async function runReminderCron(): Promise<CronJobResult> {
  const supabase = getSupabaseServerClient();
  const timeZone = process.env.APP_TIMEZONE ?? 'Asia/Jakarta';
  const { date, hhmm } = getNowParts(timeZone);

  const { data: reminderRows, error: reminderError } = await supabase
    .from('custom_reminders')
    .select('id, title, body')
    .eq('is_active', true)
    .eq('schedule_time', hhmm)
    .order('sort_order', { ascending: true });

  if (reminderError) {
    throw new Error(reminderError.message);
  }

  const reminders = (reminderRows ?? []) as ReminderRow[];
  if (reminders.length === 0) {
    return {
      ok: true,
      job: 'reminder',
      processed: 0,
      sent: 0,
      failed: 0,
      time: hhmm,
      timeZone,
      message: 'No reminder',
      breakdown: {
        activeReminders: 0,
        eligibleUsers: 0,
        prepared: 0,
        insertedNew: 0,
        retried: 0,
        skippedDuplicate: 0
      }
    };
  }

  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, token_firebase')
    .eq('is_reminder', true)
    .not('token_firebase', 'is', null)
    .neq('token_firebase', '');

  if (userError) {
    throw new Error(userError.message);
  }

  const recipients = (users ?? []) as Array<{ id: string; token_firebase: string }>;
  if (recipients.length === 0) {

    return {
      ok: true,
      job: 'reminder',
      processed: reminders.length,
      sent: 0,
      failed: 0,
      time: hhmm,
      timeZone,
      message: 'No reminder recipients',
      breakdown: {
        activeReminders: reminders.length,
        eligibleUsers: 0,
        prepared: 0,
        insertedNew: 0,
        retried: 0,
        skippedDuplicate: 0
      }
    };
  }

  const prepared = reminders.flatMap((reminder) =>
    recipients.map((user) => ({
      dedupeKey: `reminder:${date}:${hhmm}:${reminder.id}:${user.id}`,
      reminderId: reminder.id,
      userId: user.id,
      token: user.token_firebase,
      title: reminder.title,
      body: reminder.body
    }))
  );

  const insertRows = prepared.map((item) => ({
    user_id: item.userId,
    source_type: 'reminder',
    category: 'custom_reminder',
    title: item.title,
    body: item.body,
    status: 'queued',
    scheduled_time: hhmm,
    dedupe_key: item.dedupeKey,
    metadata: {
      reminder_id: item.reminderId,
      date,
      time: hhmm
    }
  }));

  const preparedKeys = prepared.map((item) => item.dedupeKey);
  const { data: existingRows, error: existingError } = await supabase
    .from('notification_logs')
    .select('id, dedupe_key, status')
    .in('dedupe_key', preparedKeys);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingMap = new Map(
    (existingRows ?? []).map((row) => [
      row.dedupe_key as string,
      { id: row.id as number, status: row.status as string }
    ])
  );

  const newItems = prepared.filter((item) => !existingMap.has(item.dedupeKey));
  const retryItems = prepared.filter((item) => {
    const row = existingMap.get(item.dedupeKey);
    return row?.status === 'failed' || row?.status === 'queued';
  });
  const skippedDuplicate = prepared.length - newItems.length - retryItems.length;

  let insertedRows: Array<{ id: number; dedupe_key: string }> = [];
  if (newItems.length > 0) {
    const newInsertRows = insertRows.filter((row) => !existingMap.has(row.dedupe_key as string));
    const { data: newQueuedRows, error: queueError } = await supabase
      .from('notification_logs')
      .insert(newInsertRows)
      .select('id, dedupe_key');

    if (queueError) {
      throw new Error(queueError.message);
    }

    insertedRows = (newQueuedRows ?? []) as Array<{ id: number; dedupe_key: string }>;
  }

  const retryRowIds = retryItems
    .map((item) => existingMap.get(item.dedupeKey)?.id)
    .filter(Boolean) as number[];

  if (retryRowIds.length > 0) {
    const { error: retryUpdateError } = await supabase
      .from('notification_logs')
      .update({ status: 'queued', error_message: null })
      .in('id', retryRowIds);

    if (retryUpdateError) {
      throw new Error(retryUpdateError.message);
    }
  }

  const queued = [
    ...insertedRows.map((row) => ({ id: row.id, dedupe_key: row.dedupe_key })),
    ...retryItems
      .map((item) => {
        const existing = existingMap.get(item.dedupeKey);
        if (!existing) return null;
        return { id: existing.id, dedupe_key: item.dedupeKey };
      })
      .filter(Boolean)
  ] as Array<{ id: number; dedupe_key: string }>;

  if (queued.length === 0) {

    return {
      ok: true,
      job: 'reminder',
      processed: 0,
      sent: 0,
      failed: 0,
      time: hhmm,
      timeZone,
      message: 'All reminders already sent',
      breakdown: {
        activeReminders: reminders.length,
        eligibleUsers: recipients.length,
        prepared: prepared.length,
        insertedNew: 0,
        retried: 0,
        skippedDuplicate
      }
    };
  }

  let sent = 0;
  let failed = 0;

  for (const row of queued) {
    const payload = prepared.find((item) => item.dedupeKey === (row.dedupe_key as string));
    if (!payload) continue;

    const result = await sendPushNotification({
      tokens: [payload.token],
      title: payload.title,
      body: payload.body,
      data: {
        type: 'reminder',
        reminder_id: payload.reminderId,
        scheduled_time: hhmm
      }
    });

    const first = result.results[0];
    if (first?.ok) {
      sent += 1;
      await supabase
        .from('notification_logs')
        .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
        .eq('id', row.id);
    } else {
      failed += 1;
      await supabase
        .from('notification_logs')
        .update({ status: 'failed', error_message: first?.error ?? 'Unknown error' })
        .eq('id', row.id);
    }
  }

  return {
    ok: true,
    job: 'reminder',
    processed: queued.length,
    sent,
    failed,
    time: hhmm,
    timeZone,
    breakdown: {
      activeReminders: reminders.length,
      eligibleUsers: recipients.length,
      prepared: prepared.length,
      insertedNew: insertedRows.length,
      retried: retryItems.length,
      skippedDuplicate
    }
  };
}

// ── Win-back: pengingat re-engagement berbasis data belajar ──
//
// Berjalan SEKALI sehari (pada WINBACK_TIME, default 19:00 waktu app). Untuk
// tiap user dengan token aktif, pilih SATU segmen prioritas-tertinggi lalu
// kirim satu push. Tujuan: hanya menyapa user yang benar-benar perlu didorong
// (streak mau putus / vakum / belum pernah mulai) — bukan broadcast ke semua.

type WinbackSegment = 'streak_at_risk' | 'inactive_learner' | 'never_started';

const WINBACK_MESSAGES: Record<
  WinbackSegment,
  { title: string; body: string }
> = {
  streak_at_risk: {
    title: 'Streak-mu hampir putus! 🔥',
    body: 'Sempatkan 1 menit Latihan Kilat malam ini biar istiqomahmu tetap nyala.'
  },
  inactive_learner: {
    title: 'Si Pelita kangen 🪔',
    body: 'Yuk lanjut belajar ngaji — cuma 1 menit kok. Bismillah!'
  },
  never_started: {
    title: 'Coba Latihan Kilat ✨',
    body: 'Belajar baca Al-Qur’an seru ala game. 1 menit pertamamu menanti!'
  }
};

type WinbackUserRow = {
  id: string;
  token_firebase: string;
  created_at: string | null;
  learning_streak: number | null;
  learning_lessons_done: number | null;
  learning_last_active_at: string | null;
};

/** Aritmetika tanggal kalender (YYYY-MM-DD), aman timezone. */
function addCalendarDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function classifyWinback(
  user: WinbackUserRow,
  opts: { yesterday: string; inactiveCutoff: string; signupCutoff: string }
): WinbackSegment | null {
  const lastActive = user.learning_last_active_at
    ? user.learning_last_active_at.slice(0, 10)
    : null;
  const streak = user.learning_streak ?? 0;
  const done = user.learning_lessons_done ?? 0;
  const createdDate = user.created_at ? user.created_at.slice(0, 10) : null;

  // 1) Streak berharga & aktif kemarin tapi belum hari ini → akan putus.
  if (streak >= 3 && lastActive === opts.yesterday) return 'streak_at_risk';
  // 2) Pernah belajar tapi sudah vakum >= 3 hari.
  if (done > 0 && lastActive !== null && lastActive <= opts.inactiveCutoff) {
    return 'inactive_learner';
  }
  // 3) Sudah pasang app >= 2 hari tapi belum pernah menyelesaikan 1 pelajaran.
  if (done === 0 && createdDate !== null && createdDate <= opts.signupCutoff) {
    return 'never_started';
  }
  return null;
}

export async function runWinbackCron(
  opts: { force?: boolean } = {}
): Promise<CronJobResult> {
  const supabase = getSupabaseServerClient();
  const timeZone = process.env.APP_TIMEZONE ?? 'Asia/Jakarta';
  const targetTime = process.env.WINBACK_TIME ?? '19:00';
  const { date, hhmm } = getNowParts(timeZone);

  const empty = (message: string): CronJobResult => ({
    ok: true,
    job: 'winback',
    processed: 0,
    sent: 0,
    failed: 0,
    time: hhmm,
    timeZone,
    message
  });

  // Hanya jalan sekali sehari pada jam target (kecuali dipaksa untuk uji).
  if (!opts.force && hhmm !== targetTime) {
    return empty(`skip (bukan ${targetTime})`);
  }

  const { data: userRows, error: userError } = await supabase
    .from('users')
    .select(
      'id, token_firebase, created_at, learning_streak, learning_lessons_done, learning_last_active_at'
    )
    .eq('is_reminder', true)
    .not('token_firebase', 'is', null)
    .neq('token_firebase', '');

  if (userError) throw new Error(userError.message);

  const cutoffs = {
    yesterday: addCalendarDays(date, -1),
    inactiveCutoff: addCalendarDays(date, -3),
    signupCutoff: addCalendarDays(date, -2)
  };

  const prepared = ((userRows ?? []) as WinbackUserRow[])
    .map((user) => {
      const segment = classifyWinback(user, cutoffs);
      if (!segment) return null;
      const msg = WINBACK_MESSAGES[segment];
      return {
        dedupeKey: `winback:${date}:${user.id}`,
        userId: user.id,
        token: user.token_firebase,
        segment,
        title: msg.title,
        body: msg.body
      };
    })
    .filter(Boolean) as Array<{
    dedupeKey: string;
    userId: string;
    token: string;
    segment: WinbackSegment;
    title: string;
    body: string;
  }>;

  if (prepared.length === 0) {
    return empty('No winback targets');
  }

  // Dedupe: 1 push per user per hari.
  const preparedKeys = prepared.map((item) => item.dedupeKey);
  const { data: existingRows, error: existingError } = await supabase
    .from('notification_logs')
    .select('dedupe_key')
    .in('dedupe_key', preparedKeys);
  if (existingError) throw new Error(existingError.message);
  const existingKeys = new Set(
    (existingRows ?? []).map((row) => row.dedupe_key as string)
  );

  const newItems = prepared.filter((item) => !existingKeys.has(item.dedupeKey));
  const skippedDuplicate = prepared.length - newItems.length;

  if (newItems.length === 0) {
    return empty('All winback already sent');
  }

  const { data: insertedRows, error: queueError } = await supabase
    .from('notification_logs')
    .insert(
      newItems.map((item) => ({
        user_id: item.userId,
        source_type: 'winback',
        category: item.segment,
        title: item.title,
        body: item.body,
        status: 'queued',
        scheduled_time: hhmm,
        dedupe_key: item.dedupeKey,
        metadata: { segment: item.segment, date, time: hhmm }
      }))
    )
    .select('id, dedupe_key');
  if (queueError) throw new Error(queueError.message);

  let sent = 0;
  let failed = 0;

  for (const row of (insertedRows ?? []) as Array<{
    id: number;
    dedupe_key: string;
  }>) {
    const payload = newItems.find((item) => item.dedupeKey === row.dedupe_key);
    if (!payload) continue;

    const result = await sendPushNotification({
      tokens: [payload.token],
      title: payload.title,
      body: payload.body,
      data: {
        type: 'winback',
        segment: payload.segment,
        scheduled_time: hhmm
      }
    });

    const first = result.results[0];
    if (first?.ok) {
      sent += 1;
      await supabase
        .from('notification_logs')
        .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
        .eq('id', row.id);
    } else {
      failed += 1;
      await supabase
        .from('notification_logs')
        .update({ status: 'failed', error_message: first?.error ?? 'Unknown error' })
        .eq('id', row.id);
    }
  }

  return {
    ok: true,
    job: 'winback',
    processed: newItems.length,
    sent,
    failed,
    time: hhmm,
    timeZone
  };
}
