'use client';

import { useCallback, useEffect, useState } from 'react';
import { PINInput } from '@/components/app/PINInput';
import { QRDisplay } from '@/components/app/QRDisplay';
import { buildSessionQrPayload } from '@/lib/qr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QR_SESSION_MINUTES } from '@/lib/types';

export default function BankQRPage() {
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [remaining, setRemaining] = useState(0);

  const createSession = useCallback(async (pin: string) => {
    setError('');
    const res = await fetch('/api/qr-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Failed');
      return;
    }
    setQrValue(buildSessionQrPayload(data.token));
    setExpiresAt(new Date(data.expires_at));
    setVerified(true);
  }, []);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const sec = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setRemaining(sec);
      if (sec === 0) setVerified(false);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!verified) {
    return (
      <main className="p-4 space-y-4">
        <Card>
          <p className="font-display text-sm mb-4">ENTER PIN TO SHOW QR</p>
          <PINInput
            onComplete={async (pin) => {
              const v = await fetch('/api/verify-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin }),
              });
              const d = await v.json();
              if (!d.valid) {
                setError(d.error ?? 'Incorrect PIN');
                return;
              }
              await createSession(pin);
            }}
            error={error}
          />
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4 space-y-4 flex flex-col items-center">
      <QRDisplay value={qrValue} label="Scan to send EnCoins" expiresIn={remaining} />
      {remaining === 0 && (
        <Button onClick={() => setVerified(false)}>GENERATE NEW QR</Button>
      )}
      <p className="text-xs text-text-secondary text-center">
        Valid for {QR_SESSION_MINUTES} minutes
      </p>
    </main>
  );
}
