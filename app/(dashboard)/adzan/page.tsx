import { Moon } from 'lucide-react';
import { getSupabaseServerClient } from '@/lib/supabase';
import { AdzanTable } from '@/components/tables/adzan-table';
import { AdzanRow } from '@/components/tables/adzan-columns';
import { PageHeader } from '@/components/page-header';

export const dynamic = 'force-dynamic';

const SORT_FIELDS = new Set(['created_at', 'city_name']);

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

async function fetchAdzan(p: {
  page: number;
  size: number;
  sort: string;
  q: string;
}) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from('adzan_notification')
    .select(
      'id, user_id, city_name, is_imsak, is_subuh, is_dzuhur, is_ashar, is_maghrib, is_isya, imsak_time, subuh_time, dzuhur_time, ashar_time, maghrib_time, isya_time',
      { count: 'exact' }
    );

  if (p.q) {
    const safe = p.q.replace(/[,()*%]/g, '').trim();
    if (safe) query = query.ilike('city_name', `%${safe}%`);
  }

  const [field, dir] = p.sort.split('.');
  const sortField = SORT_FIELDS.has(field) ? field : 'created_at';
  query = query.order(sortField, { ascending: dir === 'asc' });

  const from = (p.page - 1) * p.size;
  query = query.range(from, from + p.size - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return {
    data: (data ?? []) as AdzanRow[],
    rowCount: count ?? 0,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / p.size)),
  };
}

export default async function AdzanPage({
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

  const { data, rowCount, pageCount } = await fetchAdzan({ page, size, sort, q });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Moon}
        title="Adzan"
        description={`Preferensi adzan per pengguna (diatur dari aplikasi) · ${rowCount.toLocaleString('id-ID')} entri`}
      />
      <AdzanTable
        data={data}
        rowCount={rowCount}
        pageCount={pageCount}
        page={page}
        size={size}
        sort={sort}
        q={q}
      />
    </div>
  );
}
