'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/status-badge';
import { formatDateTime } from '@/lib/utils';

export type RecentLog = {
  created_at: string;
  source_type: string | null;
  title: string | null;
  status: string | null;
};

const columns: ColumnDef<RecentLog>[] = [
  {
    accessorKey: 'created_at',
    header: 'Waktu',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDateTime(row.original.created_at)}
      </span>
    ),
  },
  {
    accessorKey: 'source_type',
    header: 'Jenis',
    cell: ({ row }) => (
      <span className="capitalize">{row.original.source_type ?? '-'}</span>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Judul',
    cell: ({ row }) => row.original.title ?? '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export function RecentNotifications({ data }: { data: RecentLog[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      hideToolbar
      hidePagination
      emptyText="Belum ada notifikasi."
    />
  );
}
