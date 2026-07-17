export function DistributionBars({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-16 shrink-0 text-xs text-muted-foreground">
            {d.label}
          </div>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <div className="w-12 shrink-0 text-right text-sm font-semibold">
            {d.count.toLocaleString('id-ID')}
          </div>
        </div>
      ))}
    </div>
  );
}
