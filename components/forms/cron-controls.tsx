'use client';

import { useState } from 'react';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const JOBS: { path: string; label: string }[] = [
  { path: '/api/cron/run', label: 'Jalankan Semua Cron' },
  { path: '/api/cron/adzan', label: 'Cron Adzan' },
  { path: '/api/cron/reminders', label: 'Cron Reminder' },
  { path: '/api/cron/winback?force=1', label: 'Win-back (paksa)' },
];

export function CronControls() {
  const [busy, setBusy] = useState('');

  async function run(path: string) {
    setBusy(path);
    try {
      const res = await fetch(path, { method: 'POST' });
      const json = await res.json();
      if (!res.ok || json.ok === false) {
        toast.error(json.error ?? 'Gagal menjalankan cron');
      } else {
        const t = json.total ?? json;
        toast.success(
          `OK — processed ${t.processed ?? json.processed ?? 0}, sent ${
            t.sent ?? json.sent ?? 0
          }, failed ${t.failed ?? json.failed ?? 0}`
        );
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy('');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontrol Cron (manual)</CardTitle>
        <CardDescription>
          Picu job secara manual. Otomatisasi berjalan via scheduler (lihat
          Phase 14 / cron worker).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {JOBS.map((j) => (
            <Button
              key={j.path}
              variant="outline"
              disabled={busy !== ''}
              onClick={() => run(j.path)}
            >
              {busy === j.path ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {j.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
