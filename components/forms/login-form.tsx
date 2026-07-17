'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? 'Login gagal');
        setLoading(false);
      } else {
        // Biarkan loading tetap true selama transisi ke dashboard.
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardContent className="pt-6">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-3 pb-2 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-2xl text-primary-foreground shadow-sm">
              ☪️
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Quran Saya CMS
              </h1>
              <p className="text-sm text-muted-foreground">
                Masuk ke panel admin
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@quransaya.id"
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses…
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
