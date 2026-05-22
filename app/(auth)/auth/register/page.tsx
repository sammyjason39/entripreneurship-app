'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { friendlyAuthError } from '@/lib/auth-messages';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const handleResend = async () => {
    setResendMsg('');
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setResendMsg(resendError ? resendError.message : 'Confirmation email sent again. Check your inbox.');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAwaitingConfirm(false);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/onboarding`;

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: redirectTo,
      },
    });
    if (authError) {
      setLoading(false);
      setError(friendlyAuthError(authError.message));
      return;
    }

    // Email confirmation ON → no session until user clicks link in email
    if (!data.session) {
      setLoading(false);
      setAwaitingConfirm(true);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          full_name: fullName.trim(),
          app_role: 'participant',
        },
        { onConflict: 'id' }
      );
      if (profileError) {
        setLoading(false);
        setError(profileError.message);
        return;
      }
    }
    setLoading(false);
    router.push('/onboarding');
    router.refresh();
  };

  if (awaitingConfirm) {
    return (
      <main className="flex min-h-dvh flex-col justify-center p-6">
        <Card className="space-y-4 border-accent-green/50">
          <p className="font-display text-sm text-accent-green">CHECK YOUR EMAIL</p>
          <p className="font-body text-sm text-text-secondary">
            We sent a confirmation link to <strong className="text-text-primary">{email}</strong>.
            Open it on this device, then log in to continue onboarding.
          </p>
          <Button type="button" variant="outline" className="w-full" onClick={handleResend}>
            RESEND EMAIL
          </Button>
          {resendMsg && (
            <p className={`text-sm ${resendMsg.includes('sent') ? 'text-accent-green' : 'text-accent-red'}`}>
              {resendMsg}
            </p>
          )}
          <Link href="/auth/login" className="block text-center font-display text-xs text-accent-blue">
            GO TO LOGIN →
          </Link>
        </Card>
      </main>
    );
  }

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
