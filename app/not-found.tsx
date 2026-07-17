import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div className="space-y-5">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-7 w-7" />
        </div>
        <div>
          <p className="text-4xl font-black tracking-tight">404</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Halaman yang kamu cari tidak ditemukan.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Kembali ke Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
