'use client';

import { useState } from 'react';
import { Loader2, Send, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type Filter = {
  reminderOnly?: boolean;
  platform?: string;
  version?: string;
  minLevel?: number;
  minStreak?: number;
  inactiveDays?: number;
  neverStarted?: boolean;
};

export function NotificationComposer() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [filter, setFilter] = useState<Filter>({ reminderOnly: true });
  const [count, setCount] = useState<number | null>(null);
  const [segmentText, setSegmentText] = useState('');
  const [busy, setBusy] = useState<'' | 'count' | 'send'>('');

  function set<K extends keyof Filter>(k: K, v: Filter[K]) {
    setFilter((f) => ({ ...f, [k]: v }));
    setCount(null);
  }

  async function call(countOnly: boolean) {
    setBusy(countOnly ? 'count' : 'send');
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, filter, countOnly }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        toast.error(json.error ?? 'Terjadi kesalahan');
      } else if (countOnly) {
        setCount(json.count);
        setSegmentText(json.segment);
      } else {
        toast.success(
          `Terkirim ${json.sent}/${json.total} penerima (gagal ${json.failed})`
        );
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy('');
    }
  }

  const canSend = title.trim() && body.trim();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pesan</CardTitle>
          <CardDescription>Judul & isi notifikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="mis. Jangan lupa tilawah hari ini"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Isi</Label>
            <Textarea
              id="body"
              value={body}
              maxLength={300}
              rows={4}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tulis pesan singkat & ramah…"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => call(true)}
              disabled={busy !== ''}
            >
              {busy === 'count' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Users className="mr-2 h-4 w-4" />
              )}
              Cek jumlah penerima
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={busy !== '' || !canSend}>
                  {busy === 'send' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Kirim
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Kirim notifikasi?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Pesan akan dikirim ke segmen yang dipilih
                    {count !== null ? ` (~${count} penerima)` : ''}. Tindakan ini
                    tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => call(false)}>
                    Ya, kirim
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {count !== null && (
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
              Segmen: {segmentText} — <b>{count}</b> penerima
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segmen penerima</CardTitle>
          <CardDescription>
            Semua filter digabung (AND). Kosongkan untuk menyertakan semua.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="reminderOnly" className="cursor-pointer">
              Hanya user yang mengaktifkan reminder
            </Label>
            <Switch
              id="reminderOnly"
              checked={!!filter.reminderOnly}
              onCheckedChange={(v) => set('reminderOnly', v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="neverStarted" className="cursor-pointer">
              Belum pernah mulai belajar
            </Label>
            <Switch
              id="neverStarted"
              checked={!!filter.neverStarted}
              onCheckedChange={(v) => set('neverStarted', v)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={filter.platform ?? 'all'}
                onValueChange={(v) =>
                  set('platform', v === 'all' ? undefined : v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="Android">Android</SelectItem>
                  <SelectItem value="iOS">iOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Versi app (opsional)</Label>
              <Input
                id="version"
                value={filter.version ?? ''}
                onChange={(e) => set('version', e.target.value || undefined)}
                placeholder="mis. 1.0.007+7"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="minLevel">Min. level</Label>
              <Input
                id="minLevel"
                type="number"
                min={0}
                value={filter.minLevel ?? ''}
                onChange={(e) =>
                  set(
                    'minLevel',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStreak">Min. streak</Label>
              <Input
                id="minStreak"
                type="number"
                min={0}
                value={filter.minStreak ?? ''}
                onChange={(e) =>
                  set(
                    'minStreak',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inactiveDays">Vakum ≥ hari</Label>
              <Input
                id="inactiveDays"
                type="number"
                min={0}
                value={filter.inactiveDays ?? ''}
                onChange={(e) =>
                  set(
                    'inactiveDays',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
