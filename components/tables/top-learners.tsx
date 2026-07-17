'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Flame } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';

export type Learner = {
  learning_name: string | null;
  learning_level: number | null;
  learning_xp: number | null;
  learning_streak: number | null;
  learning_lessons_done: number | null;
};

const columns: ColumnDef<Learner>[] = [
  {
    id: 'rank',
    header: '#',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.index + 1}</span>
    ),
  },
  {
    accessorKey: 'learning_name',
    meta: { label: 'Nama' },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.learning_name ?? '(tanpa nama)'}
      </span>
    ),
  },
  {
    accessorKey: 'learning_level',
    meta: { label: 'Level' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Level" />
    ),
    cell: ({ row }) => row.original.learning_level ?? 1,
  },
  {
    accessorKey: 'learning_xp',
    meta: { label: 'XP' },
    header: ({ column }) => <DataTableColumnHeader column={column} title="XP" />,
    cell: ({ row }) => (
      <span className="font-semibold">
        {(row.original.learning_xp ?? 0).toLocaleString('id-ID')}
      </span>
    ),
  },
  {
    accessorKey: 'learning_streak',
    meta: { label: 'Streak' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Streak" />
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1">
        <Flame className="h-3.5 w-3.5 text-[hsl(var(--chart-2))]" />
        {row.original.learning_streak ?? 0}
      </span>
    ),
  },
  {
    accessorKey: 'learning_lessons_done',
    meta: { label: 'Lesson' },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lesson" />
    ),
    cell: ({ row }) => row.original.learning_lessons_done ?? 0,
  },
];

export function TopLearners({ data }: { data: Learner[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Cari nama…"
      emptyText="Belum ada data belajar."
    />
  );
}
