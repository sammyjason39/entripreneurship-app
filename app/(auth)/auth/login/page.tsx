'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SponsorRow } from '@/components/app/SponsorRow';
import { friendlyAuthError, isEmailNotConfirmedError } from '@/lib/auth-messages';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    if (searchParams.get('error') === 'confirmation_failed') {
      setError('Email confirmation failed or expired. Try logging in or resend the email.');
    }
    if (searchParams.get('confirmed') === '1') {
      setResendMsg('Email confirmed! You can log in now.');
    }
  }, [searchParams]);

  const handleResend = async () => {
    if (!email) {
      setResendMsg('Enter your email address first.');
      return;
    }
    setResendMsg('');
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setResendMsg(
      resendError ? resendError.message : 'Confirmation email sent. Check your inbox and spam folder.'
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNeedsConfirm(false);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      const msg = authError.message;
      if (isEmailNotConfirmedError(msg)) {
        setNeedsConfirm(true);
      }
      setError(friendlyAuthError(msg));
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
          {resendMsg && (
            <p
              className={`text-sm ${resendMsg.includes('sent') || resendMsg.includes('confirmed') ? 'text-accent-green' : 'text-accent-red'}`}
            >
              {resendMsg}
            </p>
          )}
          {needsConfirm && (
            <Button type="button" variant="outline" className="w-full" onClick={handleResend}>
              RESEND CONFIRMATION EMAIL
            </Button>
          )}
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
