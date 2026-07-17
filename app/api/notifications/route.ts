import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/cms-auth';
import { validateFcmEnv, validateSupabaseEnv } from '@/lib/env';
import { getSupabaseServerClient } from '@/lib/supabase';
import {
  fetchSegmentUsers,
  describeSegment,
  SegmentFilter,
} from '@/lib/segments';
import { sendPushNotification } from '@/lib/fcm';

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    validateSupabaseEnv();
    const payload = (await request.json()) as {
      title?: string;
      body?: string;
      filter?: SegmentFilter;
      countOnly?: boolean;
    };
    const filter = payload.filter ?? {};
    const users = await fetchSegmentUsers(filter);

    if (payload.countOnly) {
      return NextResponse.json({
        ok: true,
        count: users.length,
        segment: describeSegment(filter),
      });
    }

    if (!payload.title || !payload.body) {
      return NextResponse.json(
        { ok: false, error: 'Judul & isi wajib diisi' },
        { status: 400 }
      );
    }
    validateFcmEnv();

    const supabase = getSupabaseServerClient();
    let sent = 0;
    let failed = 0;
    const logRows: Record<string, unknown>[] = [];
    const now = new Date().toISOString();

    for (const u of users) {
      const res = await sendPushNotification({
        tokens: [u.token_firebase],
        title: payload.title,
        body: payload.body,
        data: { type: 'manual' },
      });
      const ok = res.results[0]?.ok ?? false;
      if (ok) sent += 1;
      else failed += 1;
      logRows.push({
        user_id: u.id,
        source_type: 'manual',
        category: 'broadcast',
        title: payload.title,
        body: payload.body,
        status: ok ? 'sent' : 'failed',
        error_message: ok ? null : res.results[0]?.error ?? 'error',
        sent_at: ok ? now : null,
        metadata: { segment: describeSegment(filter), by: session.email },
      });
    }

    for (let i = 0; i < logRows.length; i += 500) {
      await supabase
        .from('notification_logs')
        .insert(logRows.slice(i, i + 500));
    }

    return NextResponse.json({ ok: true, total: users.length, sent, failed });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
