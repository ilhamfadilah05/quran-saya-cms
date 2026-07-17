import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSupabaseServerClient } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RecentNotifications,
  type RecentLog,
} from '@/components/tables/recent-notifications';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const PRAYERS = ['imsak', 'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2.5 last:border-none">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">
        {value === null || value === undefined || value === '' ? '-' : value}
      </span>
    </div>
  );
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  const { data: adzan } = await supabase
    .from('adzan_notification')
    .select('*')
    .eq('user_id', id)
    .maybeSingle();
  const { data: logs } = await supabase
    .from('notification_logs')
    .select('created_at, source_type, title, status')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(15);

  if (!user) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/users">
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
          </Link>
        </Button>
        <p className="text-muted-foreground">Pengguna tidak ditemukan.</p>
      </div>
    );
  }

  const rec = user as Record<string, unknown>;
  const adzanRec = adzan as Record<string, unknown> | null;
  const activePrayers = adzanRec
    ? PRAYERS.filter((p) => adzanRec[`is_${p}`])
        .map((p) => p[0].toUpperCase() + p.slice(1))
        .join(', ')
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/users">
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Detail Pengguna
          </h1>
          <p className="text-xs text-muted-foreground">{id}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perangkat</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Field label="Platform" value={rec.platform as string} />
            <Field label="Versi app" value={rec.version as string} />
            <Field label="Device" value={rec.device_name as string} />
            <Field
              label="Reminder"
              value={rec.is_reminder ? 'Aktif' : 'Nonaktif'}
            />
            <Field
              label="Punya token FCM"
              value={rec.token_firebase ? 'Ya' : 'Tidak'}
            />
            <Field
              label="Terdaftar"
              value={formatDateTime(rec.created_at as string)}
            />
            <Field
              label="Terakhir buka"
              value={
                rec.last_opened_at
                  ? formatDateTime(rec.last_opened_at as string)
                  : null
              }
            />
            <Field
              label="Ayat terakhir dibaca"
              value={rec.last_read_ayat as number}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Belajar Ngaji</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Field label="Nama" value={rec.learning_name as string} />
            <Field label="Level" value={rec.learning_level as number} />
            <Field label="Poin (XP)" value={rec.learning_xp as number} />
            <Field label="Streak" value={rec.learning_streak as number} />
            <Field
              label="Streak terpanjang"
              value={rec.learning_longest_streak as number}
            />
            <Field
              label="Lesson selesai"
              value={rec.learning_lessons_done as number}
            />
            <Field
              label="Terakhir aktif belajar"
              value={
                rec.learning_last_active_at
                  ? formatDateTime(rec.learning_last_active_at as string)
                  : null
              }
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adzan</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {adzanRec ? (
            <>
              <Field label="Kota" value={adzanRec.city_name as string} />
              <Field label="Waktu aktif" value={activePrayers || 'tidak ada'} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Belum mengatur adzan.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Notifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentNotifications data={(logs ?? []) as RecentLog[]} />
        </CardContent>
      </Card>
    </div>
  );
}
