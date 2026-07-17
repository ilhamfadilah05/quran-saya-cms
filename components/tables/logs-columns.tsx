'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { ExternalLink } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { StatusBadge } from '@/components/status-badge';
import { formatDateTime } from '@/lib/utils';

export type LogRow = {
  created_at: string;
  user_id: string | null;
  user_name: string | null;
  source_type: string | null;
  category: string | null;
  title: string | null;
  status: string | null;
  error_message: string | null;
};

export const logsColumns: ColumnDef<LogRow>[] = [
  {
    accessorKey: 'created_at',
    meta: { label: 'Waktu' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Waktu" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatDateTime(row.original.created_at)}
      </span>
    ),
  },
  {
    accessorKey: 'user_id',
    meta: { label: 'Pengguna' },
    header: 'Pengguna',
    enableSorting: false,
    cell: ({ row }) => {
      const { user_id, user_name } = row.original;
      if (!user_id) {
        return <span className="text-muted-foreground">— Broadcast</span>;
      }
      const label = user_name?.trim() || `${user_id.slice(0, 8)}…`;
      return (
        <Link
          href={`/users/${user_id}`}
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          aria-label={`Lihat detail ${label}`}
        >
          {label}
          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
        </Link>
      );
    },
  },
  {
    accessorKey: 'source_type',
    meta: { label: 'Jenis' },
    header: 'Jenis',
    enableSorting: false,
    cell: ({ row }) => (
      <span className="capitalize">{row.original.source_type ?? '-'}</span>
    ),
  },
  {
    accessorKey: 'category',
    meta: { label: 'Kategori' },
    header: 'Kategori',
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.category ?? '-'}
      </span>
    ),
  },
  {
    accessorKey: 'title',
    meta: { label: 'Judul' },
    header: 'Judul',
    enableSorting: false,
    cell: ({ row }) => row.original.title ?? '-',
  },
  {
    accessorKey: 'status',
    meta: { label: 'Status' },
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'error_message',
    meta: { label: 'Error' },
    header: 'Error',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.error_message ? (
        <span className="text-xs text-destructive">
          {row.original.error_message}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];
