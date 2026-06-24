import { NextResponse } from 'next/server';
import { canAccessCronRoute } from '@/lib/cms-auth';
import { validateFcmEnv, validateSupabaseEnv } from '@/lib/env';
import { runWinbackCron } from '@/lib/cron-jobs';

export async function POST(request: Request) {
  if (!(await canAccessCronRoute(request))) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    validateSupabaseEnv();
    validateFcmEnv();

    // ?force=1 mengabaikan gerbang jam (untuk uji manual dari dashboard).
    const force = new URL(request.url).searchParams.get('force') === '1';
    const result = await runWinbackCron({ force });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}
