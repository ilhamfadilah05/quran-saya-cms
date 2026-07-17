import { NextResponse } from 'next/server';
import { canAccessCronRoute } from '@/lib/cms-auth';
import { validateFcmEnv, validateSupabaseEnv } from '@/lib/env';
import { runAdzanCron } from '@/lib/cron-jobs';

export async function POST(request: Request) {
  if (!(await canAccessCronRoute(request)))
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    validateSupabaseEnv();
    validateFcmEnv();
    return NextResponse.json(await runAdzanCron());
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
