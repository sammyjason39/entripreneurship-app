'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { PINInput } from '@/components/app/PINInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type TeamRow = { id: string; name: string; balance: number };

export default function CrewDeductPage() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [teamId, setTeamId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'pin'>('form');
  const [done, setDone] = useState('');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('teams').select('id, name, balance').order('name');
      setTeams((data ?? []) as TeamRow[]);
    };
    load();
  }, []);

  const selected = teams.find((t) => t.id === teamId);

  const deduct = async (pin: string) => {
    setError('');
    const res = await fetch('/api/transactions/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin,
        team_id: teamId,
        amount: parseInt(amount, 10),
        note,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Deduction failed');
      setStep('form');
      return;
    }
    const t = data as { team?: { name: string; balance: number } };
    setDone(`${t.team?.name ?? 'Team'} — new balance: ${t.team?.balance ?? '?'} EC`);
    setStep('form');
    setAmount('');
    setNote('');
  };

  if (step === 'pin') {
    return (
      <main className="space-y-4 p-4">
        <Card>
          <p className="mb-3 font-display text-xs text-text-secondary">CONFIRM WITH CREW PIN</p>
          <p className="mb-4 font-body text-sm">
            Deduct <strong>{amount} EC</strong> from {selected?.name}
          </p>
          <PINInput onComplete={deduct} error={error} />
          <Button variant="ghost" className="mt-4 w-full" onClick={() => setStep('form')}>
            BACK
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-4 p-4 text-on-bg-readable">
      <Link href="/crew/pay" className="font-display text-[10px] text-link-on-bg underline">
        ← Back to payments
      </Link>
      <h1 className="font-display text-lg font-bold">Deduct EnCoins</h1>
      <Card className="space-y-4">
        <div>
          <label className="font-display text-[10px] text-text-secondary">TEAM</label>
          <select
            className="mt-1 flex h-11 w-full rounded-card border border-border bg-bg-secondary px-3 font-body text-sm text-text-on-surface"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            <option value="">Select team…</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.balance} EC)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-display text-[10px] text-text-secondary">AMOUNT</label>
          <Input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="EnCoins to remove"
          />
        </div>
        <div>
          <label className="font-display text-[10px] text-text-secondary">NOTE</label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason" />
        </div>
        {error && <p className="text-sm text-accent-red">{error}</p>}
        {done && <p className="text-sm font-semibold text-accent-green">{done}</p>}
        <Button
          className="w-full"
          disabled={!teamId || !amount || parseInt(amount, 10) <= 0}
          onClick={() => setStep('pin')}
        >
          CONTINUE
        </Button>
      </Card>
    </main>
  );
}
