import { CardSkeleton, HeaderSkeleton } from '@/components/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton lines={6} />
        <CardSkeleton lines={4} />
      </div>
    </div>
  );
}
