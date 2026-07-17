import { Users } from 'lucide-react';
import { getSupabaseServerClient } from '@/lib/supabase';
import { UsersTable } from '@/components/tables/users-table';
import { UserRow } from '@/components/tables/users-columns';
import { PageHeader } from '@/components/page-header';

export const dynamic = 'force-dynamic';

const SORT_FIELDS = new Set([
  'created_at',
  'last_opened_at',
  'learning_level',
  'learning_xp',
]);

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

async function fetchUsers(p: {
  page: number;
  size: number;
  sort: string;
  q: string;
  platform?: string;
  reminder?: string;
  hasToken?: string;
}) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from('users')
    .select(
      'id, created_at, platform, version, is_reminder, token_firebase, last_opened_at, learning_name, learning_level, learning_streak',
      { count: 'exact' }
    );

  if (p.q) {
    const safe = p.q.replace(/[,()*%]/g, '').trim();
    if (safe) {
      query = query.or(
        `device_name.ilike.*${safe}*,learning_name.ilike.*${safe}*,device_id.ilike.*${safe}*`
      );
    }
  }
  if (p.platform) query = query.eq('platform', p.platform);
  if (p.reminder === 'true') query = query.eq('is_reminder', true);
  if (p.reminder === 'false') query = query.eq('is_reminder', false);
  if (p.hasToken === 'true')
    query = query.not('token_firebase', 'is', null).neq('token_firebase', '');
  if (p.hasToken === 'false')
    query = query.or('token_firebase.is.null,token_firebase.eq.');

  const [field, dir] = p.sort.split('.');
  const sortField = SORT_FIELDS.has(field) ? field : 'created_at';
  query = query.order(sortField, { ascending: dir === 'asc' });

  const from = (p.page - 1) * p.size;
  query = query.range(from, from + p.size - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return {
    data: (data ?? []) as UserRow[],
    rowCount: count ?? 0,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / p.size)),
  };
}

export default async function UsersPage({
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
  const platform = one(sp.platform);
  const reminder = one(sp.reminder);
  const hasToken = one(sp.hasToken);

  const { data, rowCount, pageCount } = await fetchUsers({
    page,
    size,
    sort,
    q,
    platform,
    reminder,
    hasToken,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Pengguna"
        description={`${rowCount.toLocaleString('id-ID')} perangkat terdaftar`}
      />
      <UsersTable
        data={data}
        rowCount={rowCount}
        pageCount={pageCount}
        page={page}
        size={size}
        sort={sort}
        q={q}
        platform={platform}
        reminder={reminder}
        hasToken={hasToken}
      />
    </div>
  );
}
