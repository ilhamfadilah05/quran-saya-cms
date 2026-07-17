import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export type KpiAccent = 'green' | 'gold' | 'blue' | 'purple' | 'danger';

const ACCENT_VAR: Record<KpiAccent, string> = {
  green: '--primary',
  gold: '--chart-2',
  blue: '--chart-3',
  purple: '--chart-4',
  danger: '--destructive',
};

export function KpiCard({
  icon: Icon,
  value,
  label,
  sub,
  accent = 'green',
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sub?: string;
  accent?: KpiAccent;
}) {
  const v = ACCENT_VAR[accent];
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.10] blur-2xl transition-opacity duration-200 group-hover:opacity-20"
        style={{ backgroundColor: `hsl(var(${v}))` }}
      />
      <CardContent className="p-5">
        <div
          className="grid h-11 w-11 place-items-center rounded-xl"
          style={{
            backgroundColor: `hsl(var(${v}) / 0.15)`,
            color: `hsl(var(${v}))`,
          }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-4 text-3xl font-extrabold tracking-tight tabular-nums">
          {value}
        </div>
        <div className="mt-1 text-sm font-medium">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}
