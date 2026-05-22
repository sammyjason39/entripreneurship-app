'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push('/onboarding');
    router.refresh();
  };

  return (
    <main className="flex min-h-dvh flex-col justify-center p-6">
      <div className="win98-dialog">
        <div className="win98-titlebar">
          <span>REGISTER</span>
          <span>×</span>
        </div>
        <Card className="border-0 rounded-none">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="font-display text-[10px] text-text-secondary">FULL NAME</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="font-display text-[10px] text-text-secondary">EMAIL</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="font-display text-[10px] text-text-secondary">PASSWORD (8+)</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {error && <p className="text-sm text-accent-red">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'LOADING...' : 'CREATE ACCOUNT'}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-text-secondary">
            <Link href="/auth/login" className="text-accent-green">
              Back to login
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
