'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type AdzanRow = {
  id: number;
  user_id: string | null;
  city_name: string | null;
  is_imsak: boolean | null;
  is_subuh: boolean | null;
  is_dzuhur: boolean | null;
  is_ashar: boolean | null;
  is_maghrib: boolean | null;
  is_isya: boolean | null;
  imsak_time: string | null;
  subuh_time: string | null;
  dzuhur_time: string | null;
  ashar_time: string | null;
  maghrib_time: string | null;
  isya_time: string | null;
};

const PRAYERS: [string, string][] = [
  ['imsak', 'Imsak'],
  ['subuh', 'Subuh'],
  ['dzuhur', 'Dzuhur'],
  ['ashar', 'Ashar'],
  ['maghrib', 'Maghrib'],
  ['isya', 'Isya'],
];

const prayerColumns: ColumnDef<AdzanRow>[] = PRAYERS.map(([key, label]) => ({
  id: key,
  header: label,
  enableSorting: false,
  cell: ({ row }) => {
    const r = row.original as unknown as Record<string, unknown>;
    const active = r[`is_${key}`] as boolean | null;
    const time = r[`${key}_time`] as string | null;
    return active ? (
      <Badge variant="secondary" className="tabular-nums">
        {time ?? 'on'}
      </Badge>
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  },
}));

export const adzanColumns: ColumnDef<AdzanRow>[] = [
  {
    accessorKey: 'city_name',
    meta: { label: 'Kota' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kota" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.city_name ?? '-'}</span>
    ),
  },
  ...prayerColumns,
  {
    id: 'actions',
    header: '',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) =>
      row.original.user_id ? (
        <Button asChild variant="ghost" size="sm" className="h-8">
          <Link href={`/users/${row.original.user_id}`}>User</Link>
        </Button>
      ) : null,
  },
];
