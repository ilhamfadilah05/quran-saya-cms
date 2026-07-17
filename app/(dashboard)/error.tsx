'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="max-w-md">
        <CardContent className="space-y-4 p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Terjadi kesalahan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.message || 'Gagal memuat halaman. Coba lagi.'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pastikan variabel environment (Supabase/FCM) sudah terisi.
            </p>
          </div>
          <Button onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Coba lagi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
