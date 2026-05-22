'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRScanner } from '@/components/app/QRScanner';
import { PINInput } from '@/components/app/PINInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { parseQrData } from '@/lib/utils';
import { TRANSACTION_PIN_VERIFY_SHORT } from '@/lib/copy';

type ScanStep = 'scan' | 'confirm' | 'pin';

export default function BankScanPage() {
  const router = useRouter();
  const [step, setStep] = useState<ScanStep>('scan');
  const [sessionToken, setSessionToken] = useState('');
  const [sessionInfo, setSessionInfo] = useState<{
    initiator_role: string;
    preset_amount: number | null;
    team_name?: string;
    note?: string;
  } | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pinReset, setPinReset] = useState(0);

  const handleScan = async (raw: string) => {
    const parsed = parseQrData(raw);
    if (!parsed) {
      setError('Invalid QR code');
      return;
    }

    if (parsed.type === 'static') {
      setMessage('Static QR — use crew scanner for rewards');
      return;
    }

    const res = await fetch(`/api/qr-sessions/${parsed.token}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Session not found');
      return;
    }
    setSessionToken(parsed.token);
    setSessionInfo(data);
    setAmount(data.preset_amount?.toString() ?? '');
    setStep('confirm');
    setError('');
  };

  const complete = async (pin: string) => {
    const res = await fetch(`/api/qr-sessions/${sessionToken}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin,
        amount: parseInt(amount, 10),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Failed');
      setPinReset((n) => n + 1);
      return;
    }
    router.push('/bank');
    router.refresh();
  };

  if (step === 'scan') {
    return (
      <main className="p-4 space-y-4">
        <p className="font-display text-sm">SCAN QR</p>
        <QRScanner onScan={handleScan} onError={setError} />
        {error && <p className="text-accent-red text-sm">{error}</p>}
        {message && <p className="text-accent-blue text-sm">{message}</p>}
      </main>
    );
  }

  if (step === 'confirm') {
    const isCrewReward = sessionInfo?.initiator_role === 'crew';
    return (
      <main className="p-4 space-y-4">
        <Card>
          <p className="font-display text-sm">
            {isCrewReward
              ? `Receive ${sessionInfo?.preset_amount ?? amount} EC from crew?`
              : `Send EnCoins to ${sessionInfo?.team_name ?? 'team'}?`}
          </p>
          {!sessionInfo?.preset_amount && !isCrewReward && (
            <Input
              className="mt-4"
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          )}
          <Button className="w-full mt-4" onClick={() => setStep('pin')}>
            CONFIRM
          </Button>
          <Button variant="ghost" className="w-full mt-2" onClick={() => setStep('scan')}>
            CANCEL
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4">
      <Card className="space-y-4">
        <p className="font-display text-sm">AUTHORIZE PAYMENT</p>
        <p className="font-body text-sm text-text-secondary">{TRANSACTION_PIN_VERIFY_SHORT}</p>
        <PINInput resetKey={pinReset} onComplete={complete} error={error} />
      </Card>
    </main>
  );
}
