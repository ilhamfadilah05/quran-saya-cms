'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PaginationState, SortingState, Updater } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/data-table';
import { adzanColumns, AdzanRow } from './adzan-columns';
import { Input } from '@/components/ui/input';

export function AdzanTable(props: {
  data: AdzanRow[];
  rowCount: number;
  pageCount: number;
  page: number;
  size: number;
  sort: string;
  q: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = useCallback(
    (patch: Record<string, string | undefined>, resetPage = true) => {
      const sp = new URLSearchParams(params.toString());
      if (resetPage) sp.delete('page');
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === '') sp.delete(k);
        else sp.set(k, v);
      }
      const qs = sp.toString();
      startTransition(() =>
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
      );
    },
    [params, pathname, router]
  );

  const [search, setSearch] = useState(props.q);
  useEffect(() => setSearch(props.q), [props.q]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== props.q) update({ q: search || undefined });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const sorting: SortingState = props.sort
    ? [{ id: props.sort.split('.')[0], desc: props.sort.split('.')[1] === 'desc' }]
    : [];
  const pagination: PaginationState = {
    pageIndex: props.page - 1,
    pageSize: props.size,
  };

  const onSortingChange = (updater: Updater<SortingState>) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater;
    const s = next[0];
    update({ sort: s ? `${s.id}.${s.desc ? 'desc' : 'asc'}` : undefined });
  };
  const onPaginationChange = (updater: Updater<PaginationState>) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater;
    update(
      {
        page: String(next.pageIndex + 1),
        size: next.pageSize !== props.size ? String(next.pageSize) : undefined,
      },
      false
    );
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Cari kota…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 w-full sm:w-[240px]"
      />
      <DataTable
        manual
        hideToolbar
        columns={adzanColumns}
        data={props.data}
        rowCount={props.rowCount}
        pageCount={props.pageCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        isLoading={isPending}
        emptyText="Belum ada data adzan."
      />
    </div>
  );
}
