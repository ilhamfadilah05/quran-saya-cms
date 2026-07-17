import { CardSkeleton, HeaderSkeleton, TableSkeleton } from '@/components/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <CardSkeleton lines={2} />
      <TableSkeleton rows={6} cols={4} />
    </div>
  );
}
