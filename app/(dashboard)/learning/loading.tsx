import {
  HeaderSkeleton,
  KpiRowSkeleton,
  TableSkeleton,
} from '@/components/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <KpiRowSkeleton />
      <TableSkeleton rows={6} cols={6} />
    </div>
  );
}
