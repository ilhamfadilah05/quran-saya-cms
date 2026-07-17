import {
  Users,
  Activity,
  BellRing,
  GraduationCap,
  MailCheck,
  Smartphone,
  Apple,
  LayoutDashboard,
} from 'lucide-react';
import { getSupabaseServerClient } from '@/lib/supabase';
import { KpiCard } from '@/components/kpi-card';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserGrowthChart } from '@/components/charts/user-growth-chart';
import {
  RecentNotifications,
  type RecentLog,
} from '@/components/tables/recent-notifications';
import { formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function daysAgoIso(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;

async function loadDashboard() {
  const supabase = getSupabaseServerClient();

  const countUsers = async (
    build: (q: QueryBuilder) => QueryBuilder
  ): Promise<number> => {
    const { count } = await build(
      supabase.from('users').select('*', { count: 'exact', head: true })
    );
    return count ?? 0;
  };

  const totalUsers = await countUsers((q) => q);
  const withToken = await countUsers((q) =>
    q.not('token_firebase', 'is', null).neq('token_firebase', '')
  );
  const reminderOn = await countUsers((q) => q.eq('is_reminder', true));
  const active7d = await countUsers((q) =>
    q.gte('last_opened_at', daysAgoIso(7))
  );
  const android = await countUsers((q) => q.eq('platform', 'Android'));
  const ios = await countUsers((q) => q.eq('platform', 'iOS'));
  const learners = await countUsers((q) => q.gt('learning_lessons_done', 0));

  const notifCount = async (status?: string): Promise<number> => {
    let q = supabase
      .from('notification_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', daysAgoIso(30));
    if (status) q = q.eq('status', status);
    const { count } = await q;
    return count ?? 0;
  };
  const notifSent = await notifCount('sent');
  const notifFailed = await notifCount('failed');

  const { data: recentUsers } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', daysAgoIso(7));
  const growth: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    growth.push({
      date: d,
      count: (recentUsers ?? []).filter(
        (u) => (u.created_at as string)?.slice(0, 10) === d
      ).length,
    });
  }

  const { data: logs } = await supabase
    .from('notification_logs')
    .select('created_at, source_type, title, status')
    .order('created_at', { ascending: false })
    .limit(8);

  return {
    totalUsers,
    withToken,
    reminderOn,
    active7d,
    android,
    ios,
    learners,
    notifSent,
    notifFailed,
    growth,
    logs: (logs ?? []) as RecentLog[],
  };
}

export default async function DashboardPage() {
  const d = await loadDashboard();
  const deliveryRate =
    d.notifSent + d.notifFailed > 0
      ? Math.round((d.notifSent / (d.notifSent + d.notifFailed)) * 100)
      : 100;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Ringkasan Quran Saya"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Users} accent="green" value={formatNumber(d.totalUsers)} label="Total pengguna" sub={`${formatNumber(d.withToken)} punya token`} />
        <KpiCard icon={Activity} accent="blue" value={formatNumber(d.active7d)} label="Aktif 7 hari" sub="dari last_opened_at" />
        <KpiCard icon={BellRing} accent="gold" value={formatNumber(d.reminderOn)} label="Reminder aktif" sub="opt-in notifikasi" />
        <KpiCard icon={GraduationCap} accent="purple" value={formatNumber(d.learners)} label="Belajar Ngaji" sub="pernah selesai lesson" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard icon={MailCheck} accent="green" value={`${deliveryRate}%`} label="Delivery rate (30h)" sub={`${formatNumber(d.notifSent)} terkirim / ${formatNumber(d.notifFailed)} gagal`} />
        <KpiCard icon={Smartphone} accent="blue" value={formatNumber(d.android)} label="Android" sub="perangkat" />
        <KpiCard icon={Apple} accent="gold" value={formatNumber(d.ios)} label="iOS" sub="perangkat" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pengguna baru (7 hari)</CardTitle>
            <CardDescription>Perangkat baru terdaftar per hari</CardDescription>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={d.growth} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifikasi terbaru</CardTitle>
            <CardDescription>8 entri terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentNotifications data={d.logs} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
