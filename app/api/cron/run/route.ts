import { NextResponse } from 'next/server';
import { canAccessCronRoute } from '@/lib/cms-auth';
import { validateFcmEnv, validateSupabaseEnv } from '@/lib/env';
import { runAdzanCron, runReminderCron, runWinbackCron } from '@/lib/cron-jobs';
import { runAdzanCron, runReminderCron, runWinbackCron } from '@/lib/cron-jobs';

export async function POST(request: Request) {
  if (!(await canAccessCronRoute(request))) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    validateSupabaseEnv();
    validateFcmEnv();
    const adzan = await runAdzanCron();
    const reminder = await runReminderCron();
    const winback = await runWinbackCron();
    return NextResponse.json({
      ok: true,
      run_every: '1 minute',
      adzan,
      reminder,
      winback,
      winback,
      total: {
        processed: adzan.processed + reminder.processed + winback.processed,
        sent: adzan.sent + reminder.sent + winback.sent,
        failed: adzan.failed + reminder.failed + winback.failed,
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
