import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { validateSupabaseEnv } from '@/lib/env';
import { ADMIN_COOKIE, createAdminSessionToken } from '@/lib/admin-session';

export async function POST(request: Request) {
  try {
    validateSupabaseEnv();
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email & password wajib diisi' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.rpc('admin_login', {
      email,
      password,
    });
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }
    const admin = Array.isArray(data) ? data[0] : data;
    if (!admin) {
      return NextResponse.json(
        { ok: false, error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    await supabase
      .from('admin')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    const token = createAdminSessionToken({
      adminId: admin.id,
      email: admin.email,
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
