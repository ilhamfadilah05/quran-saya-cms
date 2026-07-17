import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/cms-auth';
import { getSupabaseServerClient } from '@/lib/supabase';

async function guard() {
  return !!(await getAdminSession());
}

export async function GET() {
  if (!(await guard()))
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('custom_reminders')
    .select('*')
    .order('schedule_time', { ascending: true });
  if (error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, reminders: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await guard()))
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as {
    title?: string;
    body?: string;
    schedule_time?: string;
    sort_order?: number;
  };
  if (!body.title || !body.body || !body.schedule_time) {
    return NextResponse.json(
      { ok: false, error: 'Judul, isi, dan waktu wajib diisi' },
      { status: 400 }
    );
  }
  if (!/^\d{2}:\d{2}$/.test(body.schedule_time)) {
    return NextResponse.json(
      { ok: false, error: 'Format waktu harus HH:MM' },
      { status: 400 }
    );
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('custom_reminders').insert({
    title: body.title,
    body: body.body,
    schedule_time: body.schedule_time,
    is_active: true,
    sort_order: body.sort_order ?? 0,
  });
  if (error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!(await guard()))
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as {
    id?: string;
    title?: string;
    body?: string;
    schedule_time?: string;
    is_active?: boolean;
    sort_order?: number;
  };
  if (!body.id)
    return NextResponse.json({ ok: false, error: 'id wajib' }, { status: 400 });
  if (body.schedule_time && !/^\d{2}:\d{2}$/.test(body.schedule_time)) {
    return NextResponse.json(
      { ok: false, error: 'Format waktu harus HH:MM' },
      { status: 400 }
    );
  }
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of ['title', 'body', 'schedule_time', 'is_active', 'sort_order'] as const) {
    if (body[k] !== undefined) patch[k] = body[k];
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from('custom_reminders')
    .update(patch)
    .eq('id', body.id);
  if (error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await guard()))
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const { id } = (await request.json()) as { id?: string };
  if (!id)
    return NextResponse.json({ ok: false, error: 'id wajib' }, { status: 400 });
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('custom_reminders').delete().eq('id', id);
  if (error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
