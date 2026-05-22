'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SponsorRow } from '@/components/app/SponsorRow';
import { friendlyAuthError } from '@/lib/auth-messages';

type Step = 'phone' | 'whatsapp';

const WA_LOGIN_STORAGE_KEY = 'entrip_wa_login_v1';

type SavedWaLogin = {
  challengeId: string;
  code: string;
  message: string;
  waUrl: string | null;
  fullName: string;
  phone: string;
};

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
          <p className="mb-3 font-body text-xs text-text-secondary">
            Staff and jury: sign in with your crew email and password (not WhatsApp).
          </p>
          <form onSubmit={handleCrewLogin} className="space-y-3">
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
                autoComplete="current-password"
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

function LoginForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [challengeId, setChallengeId] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [polling, setPolling] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'whatsapp_not_ready') {
      setError('WhatsApp login not confirmed yet. Send the message and try again.');
    } else if (err === 'whatsapp_finish_failed') {
      setError('Could not complete login. Please start again.');
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(WA_LOGIN_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as SavedWaLogin;
      if (!saved.challengeId) return;
      setChallengeId(saved.challengeId);
      setCode(saved.code);
      setMessage(saved.message);
      setWaUrl(saved.waUrl);
      setFullName(saved.fullName);
      setPhone(saved.phone);
      setStep('whatsapp');
      setPolling(true);
    } catch {
      sessionStorage.removeItem(WA_LOGIN_STORAGE_KEY);
    }
  }, []);

  const persistLogin = (payload: SavedWaLogin) => {
    sessionStorage.setItem(WA_LOGIN_STORAGE_KEY, JSON.stringify(payload));
  };

  const clearPersistedLogin = () => {
    sessionStorage.removeItem(WA_LOGIN_STORAGE_KEY);
  };

  const startLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/whatsapp/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? 'Could not start WhatsApp login.');
      return;
    }
    const payload: SavedWaLogin = {
      challengeId: data.challengeId,
      code: data.code,
      message: data.message,
      waUrl: data.waUrl ?? null,
      fullName: data.fullName ?? '',
      phone,
    };
    setChallengeId(payload.challengeId);
    setCode(payload.code);
    setMessage(payload.message);
    setWaUrl(payload.waUrl);
    setFullName(payload.fullName);
    persistLogin(payload);
    setStep('whatsapp');
    setPolling(true);
  };

  const pollStatus = useCallback(async () => {
    if (!challengeId) return false;
    const res = await fetch(
      `/api/auth/whatsapp/status?challengeId=${encodeURIComponent(challengeId)}`,
      { cache: 'no-store' }
    );
    const data = await res.json().catch(() => ({}));
    if (data.status === 'confirmed' && data.finishUrl) {
      setPolling(false);
      clearPersistedLogin();
      window.location.href = data.finishUrl as string;
      return true;
    }
    if (data.status === 'expired') {
      setPolling(false);
      clearPersistedLogin();
      setError('Code expired. Enter your number again.');
      setStep('phone');
      return true;
    }
    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Could not check login status.');
    }
    return false;
  }, [challengeId]);

  const checkNow = async () => {
    setChecking(true);
    setError('');
    await pollStatus();
    setChecking(false);
  };

  useEffect(() => {
    if (!polling || !challengeId) return;
    const tick = () => {
      if (document.visibilityState === 'visible') void pollStatus();
    };
    const id = setInterval(tick, document.visibilityState === 'visible' ? 1500 : 4000);
    tick();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void pollStatus();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [polling, challengeId, pollStatus]);

  if (step === 'whatsapp') {
    return (
      <div className="win98-dialog mb-6">
        <div className="win98-titlebar">
          <span>WHATSAPP LOGIN</span>
          <span>×</span>
        </div>
        <Card className="border-0 rounded-none bg-bg-secondary space-y-4">
          {fullName && (
            <div className="space-y-2">
              <p className="font-body text-sm text-text-secondary">
                Hi <strong className="text-text-primary">{fullName}</strong> — open WhatsApp and send
                this exact message to <strong className="text-text-primary">Connext</strong>:
              </p>
              <ol className="list-decimal space-y-1 pl-4 font-body text-xs text-text-secondary">
                <li>
                  Tap <strong className="text-text-primary">OPEN WHATSAPP</strong> below (or open your
                  chat with Connext).
                </li>
                <li>
                  Send the message in the blue box <strong className="text-text-primary">exactly as
                  shown</strong> — do not edit the text.
                </li>
                <li>Return to this tab and wait — we sign you in automatically.</li>
              </ol>
            </div>
          )}
          <div className="rounded border-2 border-border-primary bg-bg-primary p-3 sm:p-4">
            <p className="mb-2 text-center font-display text-[10px] uppercase tracking-widest text-text-on-bg-muted">
              Message to send
            </p>
            <p className="break-words text-center font-display text-sm leading-snug tracking-wide text-accent-green [overflow-wrap:anywhere] sm:text-base">
              {message}
            </p>
            <p className="mt-3 text-center font-display text-[10px] uppercase tracking-widest text-text-on-bg-muted">
              CODE: {code}
            </p>
          </div>
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-full items-center justify-center rounded border-2 border-border-primary bg-accent-green px-4 font-display text-xs text-bg-primary shadow-win98 active:translate-x-[1px] active:translate-y-[1px]"
            >
              OPEN WHATSAPP
            </a>
          ) : (
            <p className="text-sm text-accent-red">
              WhatsApp bot number not configured. Contact the organizer.
            </p>
          )}
          <p className="text-center font-body text-xs text-text-secondary animate-blink">
            Waiting for your message… keep this tab open. We check every few seconds, or tap the
            button below when you are done.
          </p>
          <p className="text-center font-body text-xs text-text-secondary">
            If nothing happens, check WhatsApp — Connext may reply with a{' '}
            <strong className="text-text-primary">login link</strong> you can tap instead.
          </p>
          {error && <p className="text-sm text-accent-red">{error}</p>}
          <Button type="button" className="w-full" disabled={checking} onClick={checkNow}>
            {checking ? 'CHECKING…' : 'I SENT THE MESSAGE — CHECK NOW'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setPolling(false);
              clearPersistedLogin();
              setStep('phone');
              setError('');
            }}
          >
            USE DIFFERENT NUMBER
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="win98-dialog mb-6">
      <div className="win98-titlebar">
        <span>ENTRIP — LOGIN</span>
        <span>×</span>
      </div>
      <Card className="border-0 rounded-none bg-bg-secondary">
        <p className="mb-4 font-body text-xs text-text-secondary">
          Use the <strong className="text-text-primary">WhatsApp number</strong> you submitted on the
          registration form. We will verify it, then you confirm via WhatsApp.
        </p>
        <form onSubmit={startLogin} className="space-y-4">
          <div>
            <label className="font-display text-[10px] text-text-secondary">WHATSAPP NUMBER</label>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          </div>
          {error && <p className="text-sm text-accent-red">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'CHECKING...' : 'CONTINUE WITH WHATSAPP'}
          </Button>
        </form>
        <p className="mt-4 text-center font-body text-xs text-text-secondary">
          Already registered via the event form?{' '}
          <span className="text-text-primary">No new sign-up needed.</span>
        </p>
      </Card>
    </div>
  );
}

const ENTRIP_LOGO_SRC = '/brands/logo-entrip.png';

function LoginWelcome() {
  return (
    <div className="mb-8 text-center">
      <p className="font-display text-[10px] uppercase tracking-[0.35em] text-text-on-bg-muted">
        Welcome to
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ENTRIP_LOGO_SRC}
        alt="EnTripreneurship Vol. 02"
        width={320}
        height={120}
        className="mx-auto mt-3 w-full max-w-[min(100%,20rem)] object-contain"
        style={{ width: 'auto', maxWidth: '20rem', height: 'auto' }}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col justify-center p-6">
      <LoginWelcome />
      <Suspense fallback={<p className="animate-blink text-center font-display text-xs">LOADING...</p>}>
        <LoginForm />
      </Suspense>
      <Suspense fallback={null}>
        <CrewLoginForm />
      </Suspense>
      <SponsorRow />
    </main>
  );
}
