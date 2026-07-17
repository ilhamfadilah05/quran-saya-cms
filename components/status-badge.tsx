import { Badge } from '@/components/ui/badge';

const MAP: Record<
  string,
  { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
> = {
  sent: { variant: 'default', label: 'Terkirim' },
  failed: { variant: 'destructive', label: 'Gagal' },
  queued: { variant: 'secondary', label: 'Antre' },
  partial: { variant: 'secondary', label: 'Sebagian' },
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const m = MAP[status ?? ''] ?? { variant: 'outline' as const, label: status ?? '-' };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
