'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PaginationState, SortingState, Updater } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { logsColumns, LogRow } from './logs-columns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SOURCES = ['adzan', 'reminder', 'manual', 'winback'];
const STATUSES = ['sent', 'failed', 'queued', 'partial'];

export function LogsTable(props: {
  data: LogRow[];
  rowCount: number;
  pageCount: number;
  page: number;
  size: number;
  sort: string;
  q: string;
  source?: string;
  status?: string;
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

  const isFiltered = !!(props.q || props.source || props.status);

  return (
    <div className="space-y-4">
      <div className="flex flex-col flex-wrap gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Cari judul…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full sm:w-[220px]"
        />
        <Select
          value={props.source ?? 'all'}
          onValueChange={(v) => update({ source: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua jenis</SelectItem>
            {SOURCES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={props.status ?? 'all'}
          onValueChange={(v) => update({ status: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFiltered && (
          <Button
            variant="ghost"
            className="h-9"
            onClick={() =>
              startTransition(() => router.replace(pathname, { scroll: false }))
            }
          >
            Reset <X className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      <DataTable
        manual
        hideToolbar
        columns={logsColumns}
        data={props.data}
        rowCount={props.rowCount}
        pageCount={props.pageCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        isLoading={isPending}
        emptyText="Belum ada log."
      />
    </div>
  );
}
