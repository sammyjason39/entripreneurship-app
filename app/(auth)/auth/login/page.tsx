'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SponsorRow } from '@/components/app/SponsorRow';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push(searchParams.get('redirect') || '/');
    router.refresh();
  };

  return (
    <div className="win98-dialog mb-6">
      <div className="win98-titlebar">
        <span>ENTRIP — LOGIN</span>
        <span>×</span>
      </div>
      <Card className="border-0 rounded-none bg-bg-secondary">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-display text-[10px] text-text-secondary">EMAIL</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="font-display text-[10px] text-text-secondary">PASSWORD</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-accent-red">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'LOADING...' : 'LOGIN'}
          </Button>
        </form>
        <p className="mt-4 text-center font-body text-xs text-text-secondary">
          No account?{' '}
          <Link href="/auth/register" className="text-accent-green">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center p-6">
      <Suspense fallback={<p className="animate-blink text-center font-display text-xs">LOADING...</p>}>
        <LoginForm />
      </Suspense>
      <SponsorRow />
    </main>
  );
}
