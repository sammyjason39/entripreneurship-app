'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { studentIdToEmail, phoneToPassword } from '@/lib/participant-credentials';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SponsorRow } from '@/components/app/SponsorRow';
import { friendlyAuthError } from '@/lib/auth-messages';

function ParticipantLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const email = studentIdToEmail(studentId);
      const password = phoneToPassword(phone);
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(friendlyAuthError(authError.message));
        return;
      }
      router.push(searchParams.get('redirect') || '/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="win98-dialog mb-6">
      <div className="win98-titlebar">
        <span>ENTRIP — LOGIN</span>
        <span>×</span>
      </div>
      <Card className="border-0 rounded-none bg-bg-secondary">
        <p className="mb-4 font-body text-xs text-text-secondary">
          Use your <strong className="text-text-primary">student ID</strong> and the same{' '}
          <strong className="text-text-primary">WhatsApp number</strong> you registered with (as
          password).
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-display text-[10px] text-text-secondary">STUDENT ID</label>
            <Input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              autoComplete="username"
              placeholder="e.g. 2301234567"
            />
          </div>
          <div>
            <label className="font-display text-[10px] text-text-secondary">
              WHATSAPP NUMBER (password)
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="08xxxxxxxxxx"
            />
          </div>
          {error && <p className="text-sm text-accent-red">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </Button>
        </form>
        <p className="mt-4 text-center font-body text-xs text-text-secondary">
          New here?{' '}
          <Link href="/auth/register" className="text-accent-green underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}

function CrewLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCrewLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(friendlyAuthError(authError.message));
      return;
    }
    router.push(searchParams.get('redirect') || '/');
    router.refresh();
  };

  return (
    <div className="win98-dialog mb-6">
      <div className="win98-titlebar">
        <button
          type="button"
          className="flex w-full items-center justify-between bg-transparent text-left font-display text-[10px]"
          onClick={() => setOpen((o) => !o)}
        >
          <span>CREW / ADMIN LOGIN</span>
          <span>{open ? '−' : '+'}</span>
        </button>
      </div>
      {open && (
        <Card className="border-0 rounded-none bg-bg-secondary">
          <form onSubmit={handleCrewLogin} className="space-y-3">
            <div>
              <label className="font-display text-[10px] text-text-secondary">EMAIL</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="font-display text-[10px] text-text-secondary">PASSWORD</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-accent-red">{error}</p>}
            <Button type="submit" className="w-full" variant="outline" disabled={loading}>
              {loading ? 'LOADING...' : 'CREW LOGIN'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}

const ENTRIP_LOGO_SRC = '/brands/logo-entrip.png';

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center p-6">
      <div className="mb-8 text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.35em] text-text-secondary">
          Welcome to
        </p>
        <img
          src={ENTRIP_LOGO_SRC}
          alt="EnTripreneurship Vol. 02"
          className="mx-auto mt-3 w-full max-w-[min(100%,20rem)] object-contain"
        />
      </div>
      <Suspense fallback={<p className="text-center font-display text-xs">LOADING...</p>}>
        <ParticipantLoginForm />
      </Suspense>
      <Suspense fallback={null}>
        <CrewLoginForm />
      </Suspense>
      <p className="mt-6 text-center font-body text-xs text-text-secondary">
        <a href="/docs" className="font-semibold text-accent-green underline">
          Event documentation (guides for participants, crew, admin)
        </a>
      </p>
      <SponsorRow />
    </main>
  );
}
