'use client';

import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTableViewOptions } from './data-table-view-options';

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Cari…',
  children,
}: {
  table: Table<TData>;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!(table.getState().globalFilter as string);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-9 w-[200px] lg:w-[264px]"
        />
        {children}
        {isFiltered && (
          <Button
            variant="ghost"
            className="h-9 px-2 lg:px-3"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter('');
            }}
          >
            Reset
            <X className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
