import {
  GraduationCap,
  Activity,
  Flame,
  AlertTriangle,
  BookOpen,
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
import { DistributionBars } from '@/components/charts/distribution-bars';
import { TopLearners, type Learner } from '@/components/tables/top-learners';
import { formatNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function daysAgoIso(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString();
}
function startOfDayUtc(daysAgo: number) {
  const d = new Date(Date.now() - daysAgo * 86400000);
  return `${d.toISOString().slice(0, 10)}T00:00:00Z`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;

async function loadLearning() {
  const supabase = getSupabaseServerClient();
  const cnt = async (
    build: (q: QueryBuilder) => QueryBuilder
  ): Promise<number> => {
    const { count } = await build(
      supabase.from('users').select('*', { count: 'exact', head: true })
    );
    return count ?? 0;
  };

  const learners = await cnt((q) => q.gt('learning_lessons_done', 0));
  const activeLearners7d = await cnt((q) =>
    q.gte('learning_last_active_at', daysAgoIso(7))
  );
  const streak7plus = await cnt((q) =>
    q.gte('learning_streak', 7).gt('learning_lessons_done', 0)
  );
  // Streak berisiko: aktif "kemarin" (UTC) tapi belum hari ini, streak >= 3.
  const atRisk = await cnt((q) =>
    q
      .gte('learning_streak', 3)
      .gte('learning_last_active_at', startOfDayUtc(1))
      .lt('learning_last_active_at', startOfDayUtc(0))
  );
  const neverStarted = await cnt((q) =>
    q.eq('learning_lessons_done', 0).lte('created_at', daysAgoIso(2))
  );

  const levelBuckets = [
    { label: 'Lv 1', min: 1, max: 1 },
    { label: 'Lv 2-3', min: 2, max: 3 },
    { label: 'Lv 4-6', min: 4, max: 6 },
    { label: 'Lv 7-10', min: 7, max: 10 },
    { label: 'Lv 11+', min: 11, max: 99999 },
  ];
  const levels = await Promise.all(
    levelBuckets.map(async (b) => ({
      label: b.label,
      count: await cnt((q) =>
        q
          .gte('learning_level', b.min)
          .lte('learning_level', b.max)
          .gt('learning_lessons_done', 0)
      ),
    }))
  );

  const streakBuckets = [
    { label: '0', min: 0, max: 0 },
    { label: '1-2', min: 1, max: 2 },
    { label: '3-6', min: 3, max: 6 },
    { label: '7-29', min: 7, max: 29 },
    { label: '30+', min: 30, max: 99999 },
  ];
  const streaks = await Promise.all(
    streakBuckets.map(async (b) => ({
      label: b.label,
      count: await cnt((q) =>
        q
          .gte('learning_streak', b.min)
          .lte('learning_streak', b.max)
          .gt('learning_lessons_done', 0)
      ),
    }))
  );

  const { data: top } = await supabase
    .from('users')
    .select(
      'learning_name, learning_level, learning_xp, learning_streak, learning_lessons_done'
    )
    .gt('learning_xp', 0)
    .order('learning_xp', { ascending: false })
    .limit(50);

  return {
    learners,
    activeLearners7d,
    streak7plus,
    atRisk,
    neverStarted,
    levels,
    streaks,
    top: (top ?? []) as Learner[],
  };
}

export default async function LearningPage() {
  const d = await loadLearning();
  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookOpen}
        title="Analitik Belajar"
        description="Progres & retensi fitur Belajar Ngaji"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={GraduationCap} accent="purple" value={formatNumber(d.learners)} label="Total pembelajar" />
        <KpiCard icon={Activity} accent="green" value={formatNumber(d.activeLearners7d)} label="Aktif 7 hari" />
        <KpiCard icon={Flame} accent="gold" value={formatNumber(d.streak7plus)} label="Streak ≥ 7" />
        <KpiCard icon={AlertTriangle} accent="danger" value={formatNumber(d.atRisk)} label="Streak berisiko" sub="aktif kemarin, belum hari ini" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Level</CardTitle>
            <CardDescription>Sebaran level pembelajar</CardDescription>
          </CardHeader>
          <CardContent>
            <DistributionBars data={d.levels} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Streak</CardTitle>
            <CardDescription>Sebaran streak istiqomah</CardDescription>
          </CardHeader>
          <CardContent>
            <DistributionBars data={d.streaks} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Pembelajar</CardTitle>
          <CardDescription>
            Diurut XP. Catatan: {formatNumber(d.neverStarted)} pengguna sudah
            pasang &gt;2 hari tapi belum pernah menyelesaikan lesson.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopLearners data={d.top} />
        </CardContent>
      </Card>
    </div>
  );
}
