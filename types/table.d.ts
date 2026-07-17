import '@tanstack/react-table';
import { RowData } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // Menambah `label` (nama ramah kolom) untuk view-options.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
  }
}
