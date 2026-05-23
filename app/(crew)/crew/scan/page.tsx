'use client';

import { useState } from 'react';
import { QRScanner } from '@/components/app/QRScanner';
import { PINInput } from '@/components/app/PINInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { parseQrData } from '@/lib/utils';
import { teamNameFromJoin } from '@/lib/supabase-helpers';

export default function CrewScanPage() {
  const [step, setStep] = useState<'scan' | 'amount' | 'pin'>('scan');
  const [teamId, setTeamId] = useState('');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleScan = async (raw: string) => {
    setError('');
    try {
      const parsed = parseQrData(raw);
      if (!parsed) {
        setError('QR tidak dikenali. Scan QR peserta (Bank), bukan QR Pos.');
        return;
      }

      if (parsed.type === 'station') {
        setError(
          'Ini QR check-in Pos untuk TIM PESERTA. Crew tidak perlu scan — buka Station QR & check-out, tampilkan QR ini di meja Pos.'
        );
        return;
      }

      if (parsed.type === 'session') {
        const res = await fetch(`/api/qr-sessions/${parsed.token}`);
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          team_id?: string;
          team_name?: string;
          preset_amount?: number;
        };
        if (!res.ok) {
          setError(data.error ?? 'Sesi QR tidak valid');
          return;
        }
        if (!data.team_id) {
          setError('Peserta belum punya tim');
          return;
        }
        setTeamId(data.team_id);
        setLabel(data.team_name ?? 'Participant');
        setAmount(data.preset_amount?.toString() ?? '');
        setStep('amount');
        return;
      }

      const res = await fetch('/api/qr/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: parsed.token }),
      });
      const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          team_id?: string | null;
          profile?: { full_name?: string };
          team?: unknown;
        };
      if (!res.ok) {
        setError(data.error ?? 'Peserta tidak ditemukan');
        return;
      }
      if (!data.team_id || !data.profile?.full_name) {
        setError('Peserta belum punya tim atau profil tidak lengkap');
        return;
      }
      setTeamId(data.team_id);
      setLabel(`${data.profile.full_name} — ${teamNameFromJoin(data.team)}`);
      setStep('amount');
    } catch {
      setError('Gagal memproses QR. Coba lagi.');
    }
  };

  const reward = async (pin: string) => {
    const res = await fetch('/api/transactions/reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin,
        to_team_id: teamId,
        amount: parseInt(amount, 10),
        note,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? 'Gagal mengirim EnCoins');
      return;
    }
    setTeamId('');
    setLabel('');
    setNote('');
    setAmount('');
    setError('');
    setStep('scan');
  };

  if (step === 'scan') {
    return (
      <main className="p-4 space-y-4">
        <h1 className="font-display text-lg">SCAN PARTICIPANT</h1>
        <p className="font-body text-xs text-text-secondary">
          Scan QR tim peserta (Bank / My QR). Bukan QR check-in di poster Pos — itu untuk peserta di
          Missions → Scan station.
        </p>
        <QRScanner key="crew-scan-qr" onScan={handleScan} onError={setError} />
        {error && <p className="text-accent-red text-sm">{error}</p>}
      </main>
    );
  }

  if (step === 'amount') {
    return (
      <main className="p-4">
        <Card className="space-y-4">
          <p className="font-display text-sm">{label}</p>
          <Input
            type="number"
            placeholder="EnCoins amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          <Button className="w-full" onClick={() => setStep('pin')} disabled={!teamId || !amount}>
            CONTINUE
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep('scan')}>
            CANCEL
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-4">
      <Card>
        <PINInput onComplete={reward} error={error} />
      </Card>
    </main>
  );
}
