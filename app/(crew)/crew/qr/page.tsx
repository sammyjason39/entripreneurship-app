'use client';

import { useCallback, useEffect, useState } from 'react';
import { PINInput } from '@/components/app/PINInput';
import { QRDisplay } from '@/components/app/QRDisplay';
import { buildSessionQrPayload } from '@/lib/qr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CrewQRPage() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'form' | 'pin' | 'show'>('form');
  const [qrValue, setQrValue] = useState('');
  const [remaining, setRemaining] = useState(0);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState('');

  const createQr = useCallback(async (pin: string) => {
    const res = await fetch('/api/qr-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin,
        preset_amount: parseInt(amount, 10),
        note,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setQrValue(buildSessionQrPayload(data.token));
    setExpiresAt(new Date(data.expires_at));
    setStep('show');
  }, [amount, note]);

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => {
      const sec = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setRemaining(sec);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (step === 'form') {
    return (
      <main className="p-4 space-y-4">
        <h1 className="font-display text-lg">GIVE POINTS QR</h1>
        <Card className="space-y-4">
          <Input
            type="number"
            placeholder="EnCoins amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <Button className="w-full" onClick={() => setStep('pin')} disabled={!amount}>
            GENERATE QR
          </Button>
        </Card>
      </main>
    );
  }

  if (step === 'pin') {
    return (
      <main className="p-4">
        <Card>
          <p className="font-display text-sm mb-4">CREW PIN</p>
          <PINInput onComplete={createQr} error={error} />
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4 flex flex-col items-center gap-4">
      <QRDisplay
        value={qrValue}
        label={`Participant scans to receive ${amount} EC`}
        expiresIn={remaining}
      />
      <Button onClick={() => setStep('form')}>NEW QR</Button>
    </main>
  );
}
