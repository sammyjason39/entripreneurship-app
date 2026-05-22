'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SponsorRow } from '@/components/app/SponsorRow';

type Step = 'phone' | 'whatsapp';

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

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'whatsapp_not_ready') {
      setError('WhatsApp login not confirmed yet. Send the message and try again.');
    } else if (err === 'whatsapp_finish_failed') {
      setError('Could not complete login. Please start again.');
    }
  }, [searchParams]);

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
    setChallengeId(data.challengeId);
    setCode(data.code);
    setMessage(data.message);
    setWaUrl(data.waUrl ?? null);
    setFullName(data.fullName ?? '');
    setStep('whatsapp');
    setPolling(true);
  };

  const pollStatus = useCallback(async () => {
    if (!challengeId) return;
    const res = await fetch(`/api/auth/whatsapp/status?challengeId=${encodeURIComponent(challengeId)}`);
    const data = await res.json();
    if (data.status === 'confirmed' && data.finishUrl) {
      setPolling(false);
      window.location.href = data.finishUrl;
      return;
    }
    if (data.status === 'expired') {
      setPolling(false);
      setError('Code expired. Enter your number again.');
      setStep('phone');
    }
  }, [challengeId]);

  useEffect(() => {
    if (!polling || !challengeId) return;
    const id = setInterval(pollStatus, 2500);
    pollStatus();
    return () => clearInterval(id);
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
            <p className="font-body text-sm text-text-secondary">
              Hi <strong className="text-text-primary">{fullName}</strong> — open WhatsApp and send this
              exact message to <strong className="text-text-primary">Connext</strong>:
            </p>
          )}
          <div className="rounded border-2 border-border-primary bg-bg-primary p-4 text-center">
            <p className="font-display text-lg tracking-widest text-accent-green">{message}</p>
            <p className="mt-2 font-display text-[10px] text-text-secondary">CODE: {code}</p>
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
          <p className="font-body text-xs text-text-secondary text-center animate-blink">
            Waiting for your message…
          </p>
          {error && <p className="text-sm text-accent-red">{error}</p>}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setPolling(false);
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
      <p className="font-display text-[10px] uppercase tracking-[0.35em] text-text-secondary">
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
      <SponsorRow />
    </main>
  );
}
