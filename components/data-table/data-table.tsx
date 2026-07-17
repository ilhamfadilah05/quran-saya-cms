'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  SortingState,
  VisibilityState,
  Table as TanstackTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTablePagination } from './data-table-pagination';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  isLoading?: boolean;
  /** Slot filter (mis. faceted filter) di toolbar. */
  filters?: (table: TanstackTable<TData>) => React.ReactNode;
  emptyText?: string;
  initialPageSize?: number;
  /** Aksi baris (mis. buka detail). */
  onRowClick?: (row: TData) => void;
  /** Sembunyikan toolbar (search/filter/kolom) — untuk widget ringkas. */
  hideToolbar?: boolean;
  /** Sembunyikan pagination — untuk widget ringkas. */
  hidePagination?: boolean;

  // ── Mode server-side (opsional) ──
  manual?: boolean;
  rowCount?: number;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder,
  isLoading = false,
  filters,
  emptyText = 'Tidak ada data.',
  initialPageSize = 10,
  onRowClick,
  hideToolbar = false,
  hidePagination = false,
  manual = false,
  rowCount,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  globalFilter,
  onGlobalFilterChange,
}: DataTableProps<TData, TValue>) {
  const [innerSorting, setInnerSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [innerGlobalFilter, setInnerGlobalFilter] = React.useState('');
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [innerPagination, setInnerPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: manual ? sorting ?? innerSorting : innerSorting,
      columnFilters,
      globalFilter: manual ? globalFilter ?? innerGlobalFilter : innerGlobalFilter,
      columnVisibility,
      pagination: manual ? pagination ?? innerPagination : innerPagination,
    },
    onSortingChange: manual ? onSortingChange ?? setInnerSorting : setInnerSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: manual
      ? onGlobalFilterChange ?? setInnerGlobalFilter
      : setInnerGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: manual
      ? onPaginationChange ?? setInnerPagination
      : setInnerPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: manual ? undefined : getFilteredRowModel(),
    getSortedRowModel: manual ? undefined : getSortedRowModel(),
    getPaginationRowModel: manual ? undefined : getPaginationRowModel(),
    manualPagination: manual,
    manualSorting: manual,
    manualFiltering: manual,
    pageCount: manual ? pageCount ?? -1 : undefined,
  });

  const colCount = table.getAllLeafColumns().length;

  return (
    <div className="space-y-4">
      {!hideToolbar && (
        <DataTableToolbar table={table} searchPlaceholder={searchPlaceholder}>
          {filters?.(table)}
        </DataTableToolbar>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/40">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {Array.from({ length: colCount }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={onRowClick ? 'cursor-pointer' : undefined}
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={colCount}
                    className="h-28 text-center text-muted-foreground"
                  >
                    {emptyText}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!hidePagination && (
        <DataTablePagination table={table} rowCount={rowCount} />
      )}
    </div>
  );
}
