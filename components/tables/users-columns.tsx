'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Minus, Bell } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export type UserRow = {
  id: string;
  created_at: string;
  platform: string | null;
  version: string | null;
  is_reminder: boolean | null;
  token_firebase: string | null;
  last_opened_at: string | null;
  learning_name: string | null;
  learning_level: number | null;
  learning_streak: number | null;
};

export const usersColumns: ColumnDef<UserRow>[] = [
  {
    accessorKey: 'created_at',
    meta: { label: 'Terdaftar' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Terdaftar" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
  {
    accessorKey: 'platform',
    meta: { label: 'Platform' },
    header: 'Platform',
    enableSorting: false,
    cell: ({ row }) => row.original.platform ?? '-',
  },
  {
    accessorKey: 'version',
    meta: { label: 'Versi' },
    header: 'Versi',
    enableSorting: false,
    cell: ({ row }) => row.original.version ?? '-',
  },
  {
    accessorKey: 'is_reminder',
    meta: { label: 'Reminder' },
    header: 'Reminder',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.is_reminder ? (
        <Bell className="h-4 w-4 text-primary" />
      ) : (
        <Minus className="h-4 w-4 text-muted-foreground" />
      ),
  },
  {
    accessorKey: 'token_firebase',
    meta: { label: 'Token' },
    header: 'Token',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.token_firebase ? (
        <CheckCircle2 className="h-4 w-4 text-primary" />
      ) : (
        <Minus className="h-4 w-4 text-muted-foreground" />
      ),
  },
  {
    accessorKey: 'last_opened_at',
    meta: { label: 'Terakhir buka' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Terakhir buka" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.last_opened_at)}
      </span>
    ),
  },
  {
    id: 'learning',
    meta: { label: 'Belajar' },
    header: 'Belajar',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.learning_name ? (
        <span className="text-sm">
          {row.original.learning_name} ·{' '}
          <span className="text-muted-foreground">
            Lv{row.original.learning_level ?? 1} · 🔥
            {row.original.learning_streak ?? 0}
          </span>
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    id: 'actions',
    header: '',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <Button asChild variant="ghost" size="sm" className="h-8">
        <Link href={`/users/${row.original.id}`}>Detail</Link>
      </Button>
    ),
  },
];
