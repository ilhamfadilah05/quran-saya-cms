'use client';

import { useState } from 'react';

type CronState = {
  all: string;
  adzan: string;
  reminder: string;
  winback: string;
};

export function CronControls() {
  const [loading, setLoading] = useState<'all' | 'adzan' | 'reminder' | 'winback' | null>(
    null
  );
  const [status, setStatus] = useState<CronState>({
    all: '',
    adzan: '',
    reminder: '',
    winback: ''
  });

  async function run(
    path:
      | '/api/cron/run'
      | '/api/cron/adzan'
      | '/api/cron/reminders'
      | '/api/cron/winback?force=1',
    key: 'all' | 'adzan' | 'reminder' | 'winback'
  ) {
    setLoading(key);
    setStatus((prev) => ({ ...prev, [key]: '' }));

    try {
      const response = await fetch(path, { method: 'POST' });
      const json = (await response.json()) as {
        ok: boolean;
        processed?: number;
        sent?: number;
        failed?: number;
        total?: { processed: number; sent: number; failed: number };
        error?: string;
      };

      if (!response.ok || !json.ok) {
        setStatus((prev) => ({ ...prev, [key]: `Gagal: ${json.error ?? 'Unknown error'}` }));
      } else {
        const processed = json.total?.processed ?? json.processed ?? 0;
        const sent = json.total?.sent ?? json.sent ?? 0;
        const failed = json.total?.failed ?? json.failed ?? 0;
        setStatus((prev) => ({
          ...prev,
          [key]: `Sukses. processed=${processed}, sent=${sent}, failed=${failed}`
        }));
      }
    } catch (error) {
      setStatus((prev) => ({ ...prev, [key]: `Gagal: ${(error as Error).message}` }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="card grid" style={{ gap: 12 }}>
      <h2>Cron Controls</h2>
      <div className="grid" style={{ gap: 10 }}>
        <button type="button" onClick={() => run('/api/cron/run', 'all')} disabled={loading !== null}>
          {loading === 'all' ? 'Running all cron...' : 'Run Semua Cron (1 Hit)'}
        </button>
        {status.all && <p className="small">{status.all}</p>}
      </div>
      <div className="grid" style={{ gap: 10 }}>
        <button type="button" onClick={() => run('/api/cron/adzan', 'adzan')} disabled={loading !== null}>
          {loading === 'adzan' ? 'Running adzan...' : 'Run Cron Adzan Sekarang'}
        </button>
        {status.adzan && <p className="small">{status.adzan}</p>}
      </div>
      <div className="grid" style={{ gap: 10 }}>
        <button type="button" onClick={() => run('/api/cron/reminders', 'reminder')} disabled={loading !== null}>
          {loading === 'reminder' ? 'Running reminder...' : 'Run Cron Reminder Sekarang'}
        </button>
        {status.reminder && <p className="small">{status.reminder}</p>}
      </div>
      <div className="grid" style={{ gap: 10 }}>
        <button
          type="button"
          onClick={() => run('/api/cron/winback?force=1', 'winback')}
          disabled={loading !== null}
        >
          {loading === 'winback'
            ? 'Running win-back...'
            : 'Run Win-back Sekarang (paksa)'}
        </button>
        {status.winback && <p className="small">{status.winback}</p>}
      </div>
    </section>
  );
}
