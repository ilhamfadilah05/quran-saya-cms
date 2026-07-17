'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  BellRing,
  Clock,
  Loader2,
  Plus,
  Power,
  PowerOff,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

type Reminder = {
  id: string;
  title: string;
  body: string;
  schedule_time: string;
  is_active: boolean;
  sort_order: number;
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ backgroundColor: `hsl(var(--${accent}) / 0.15)` }}
        >
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums leading-none">
            {value}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReminderManager() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [rowBusy, setRowBusy] = useState('');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [time, setTime] = useState('05:30');

  const load = useCallback(async () => {
    const res = await fetch('/api/reminders');
    const json = await res.json();
    if (json.ok) setItems(json.reminders);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setTitle('');
    setBody('');
    setTime('05:30');
  }

  async function add() {
    if (!title.trim() || !body.trim()) {
      toast.error('Judul & isi wajib diisi');
      return;
    }
    if (!TIME_RE.test(time)) {
      toast.error('Format waktu harus HH:MM (00:00–23:59)');
      return;
    }
    setAdding(true);
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        body,
        schedule_time: time,
        sort_order: items.length,
      }),
    });
    const json = await res.json();
    setAdding(false);
    if (!json.ok) {
      toast.error(json.error);
      return;
    }
    toast.success('Reminder ditambahkan');
    resetForm();
    setOpen(false);
    load();
  }

  const toggle = useCallback(
    async (r: Reminder) => {
      setRowBusy(`${r.id}:toggle`);
      await fetch('/api/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id, is_active: !r.is_active }),
      });
      await load();
      setRowBusy('');
    },
    [load]
  );

  const remove = useCallback(
    async (r: Reminder) => {
      setRowBusy(`${r.id}:delete`);
      const res = await fetch('/api/reminders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id }),
      });
      const json = await res.json();
      await load();
      setRowBusy('');
      if (json.ok) toast.success('Reminder dihapus');
      else toast.error(json.error);
    },
    [load]
  );

  const activeCount = useMemo(
    () => items.filter((r) => r.is_active).length,
    [items]
  );

  const columns = useMemo<ColumnDef<Reminder>[]>(
    () => [
      {
        accessorKey: 'schedule_time',
        meta: { label: 'Jam' },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Jam" />
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.schedule_time}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        meta: { label: 'Judul' },
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Judul" />
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.title}</div>
            <div className="line-clamp-1 text-xs text-muted-foreground">
              {row.original.body}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'is_active',
        meta: { label: 'Status' },
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Switch
              checked={row.original.is_active}
              disabled={rowBusy !== ''}
              onCheckedChange={() => toggle(row.original)}
              aria-label="Aktif/nonaktif reminder"
            />
            <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
              {row.original.is_active ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                disabled={rowBusy !== ''}
                aria-label="Hapus"
              >
                {rowBusy === `${row.original.id}:delete` ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Hapus reminder &quot;{row.original.title}&quot;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Reminder ini akan dihapus permanen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={() => remove(row.original)}>
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ),
      },
    ],
    [rowBusy, toggle, remove]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<BellRing className="h-5 w-5 text-primary" />}
          label="Total reminder"
          value={items.length}
          accent="primary"
        />
        <StatCard
          icon={<Power className="h-5 w-5" style={{ color: 'hsl(var(--success))' }} />}
          label="Aktif"
          value={activeCount}
          accent="success"
        />
        <StatCard
          icon={<PowerOff className="h-5 w-5 text-muted-foreground" />}
          label="Nonaktif"
          value={items.length - activeCount}
          accent="muted"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Daftar reminder</h2>
          <p className="text-sm text-muted-foreground">
            Dikirim harian ke user yang mengaktifkan reminder.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah reminder
            </Button>
          </DialogTrigger>
          <DialogContent
            onInteractOutside={(e) => adding && e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>Tambah reminder</DialogTitle>
              <DialogDescription>
                Pengingat harian baru untuk user reminder-on.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rtime">Waktu (HH:MM)</Label>
                <Input
                  id="rtime"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={adding}
                  className="w-40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rtitle">Judul</Label>
                <Input
                  id="rtitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Yuk baca Al-Qur'an"
                  disabled={adding}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rbody">Isi pesan</Label>
                <Textarea
                  id="rbody"
                  value={body}
                  rows={3}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Luangkan waktu sejenak untuk membaca hari ini."
                  disabled={adding}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={adding}
              >
                Batal
              </Button>
              <Button onClick={add} disabled={adding}>
                {adding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan…
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Simpan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={items}
        isLoading={loading}
        searchPlaceholder="Cari judul…"
        emptyText="Belum ada reminder. Klik “Tambah reminder” untuk membuat."
      />
    </div>
  );
}
