import { ScrollText } from 'lucide-react';
import { getSupabaseServerClient } from '@/lib/supabase';
import { LogsTable } from '@/components/tables/logs-table';
import { LogRow } from '@/components/tables/logs-columns';
import { PageHeader } from '@/components/page-header';

export const dynamic = 'force-dynamic';

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

async function fetchLogs(p: {
  page: number;
  size: number;
  sort: string;
  q: string;
  source?: string;
  status?: string;
}) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from('notification_logs')
    .select(
      'created_at, user_id, source_type, category, title, status, error_message',
      {
        count: 'exact',
      }
    );

  if (p.q) {
    const safe = p.q.replace(/[,()*%]/g, '').trim();
    if (safe) query = query.ilike('title', `%${safe}%`);
  }
  if (p.source) query = query.eq('source_type', p.source);
  if (p.status) query = query.eq('status', p.status);

  const dir = p.sort.split('.')[1];
  query = query.order('created_at', { ascending: dir === 'asc' });

  const from = (p.page - 1) * p.size;
  query = query.range(from, from + p.size - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Omit<LogRow, 'user_name'>[];

  // Resolusi nama pengguna via query terpisah (tak ada FK di notification_logs).
  const ids = Array.from(
    new Set(rows.map((r) => r.user_id).filter((v): v is string => !!v))
  );
  const nameById = new Map<string, string | null>();
  if (ids.length) {
    const { data: users } = await supabase
      .from('users')
      .select('id, learning_name, device_name')
      .in('id', ids);
    for (const u of users ?? []) {
      nameById.set(
        u.id as string,
        ((u.learning_name as string) || (u.device_name as string) || null)
      );
    }
  }

  return {
    data: rows.map((r) => ({
      ...r,
      user_name: r.user_id ? nameById.get(r.user_id) ?? null : null,
    })) as LogRow[],
    rowCount: count ?? 0,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / p.size)),
  };
}

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(one(sp.page) || '1', 10) || 1);
  const sizeRaw = Number(one(sp.size));
  const size = [10, 25, 50, 100].includes(sizeRaw) ? sizeRaw : 25;
  const sort = one(sp.sort) || 'created_at.desc';
  const q = (one(sp.q) || '').trim();
  const source = one(sp.source);
  const status = one(sp.status);

  const { data, rowCount, pageCount } = await fetchLogs({
    page,
    size,
    sort,
    q,
    source,
    status,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ScrollText}
        title="Log Notifikasi"
        description={`Audit pengiriman · ${rowCount.toLocaleString('id-ID')} entri`}
      />
      <LogsTable
        data={data}
        rowCount={rowCount}
        pageCount={pageCount}
        page={page}
        size={size}
        sort={sort}
        q={q}
        source={source}
        status={status}
      />
    </div>
  );
}
