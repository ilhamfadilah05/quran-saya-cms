'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function UserGrowthChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(v: string) => v.slice(5)}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={32}
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 12,
            fontSize: 12,
            color: 'hsl(var(--foreground))',
          }}
          labelFormatter={(v: string) => `Tanggal ${v}`}
          formatter={(value: number) => [value, 'Pengguna baru']}
        />
        <Bar
          dataKey="count"
          fill="hsl(var(--primary))"
          radius={[6, 6, 3, 3]}
          maxBarSize={44}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
