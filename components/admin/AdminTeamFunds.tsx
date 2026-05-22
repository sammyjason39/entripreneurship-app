'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type TeamRow = { id: string; name: string; balance: number };

export function AdminTeamFunds({ teams }: { teams: TeamRow[] }) {
  const router = useRouter();
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const selected = teams.find((t) => t.id === teamId);

  const run = async (action: 'add' | 'deduct') => {
    setError('');
    setSuccess('');
    setLoading(true);
    const res = await fetch('/api/admin/teams/fund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_id: teamId,
        amount: Number(amount),
        action,
        note: note || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Failed');
      return;
    }
    const t = (data as { team?: TeamRow }).team;
    setSuccess(
      `${action === 'add' ? 'Added' : 'Deducted'} ${amount} EnCoins — ${t?.name ?? 'team'} now has ${t?.balance ?? '?'}`
    );
    setAmount('');
    router.refresh();
  };

  if (teams.length === 0) {
    return (
      <Card>
        <p className="font-body text-sm">No teams yet. Participants create teams during onboarding.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4">
        <p className="font-display text-xs font-bold">ADD OR DEDUCT ENCOINS</p>
        <div>
          <label className="font-display text-[10px] text-text-secondary">TEAM</label>
          <select
            className="mt-1 w-full rounded border-2 border-border-primary bg-bg-primary px-3 py-2 font-body text-sm"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.balance} EnCoins)
              </option>
            ))}
          </select>
        </div>
        {selected && (
          <p className="font-body text-sm text-text-secondary">
            Current balance: <strong className="text-accent-green">{selected.balance}</strong> EnCoins
          </p>
        )}
        <div>
          <label className="font-display text-[10px] text-text-secondary">AMOUNT</label>
          <Input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100"
          />
        </div>
        <div>
          <label className="font-display text-[10px] text-text-secondary">NOTE (optional)</label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason" />
        </div>
        {error && <p className="text-sm text-accent-red">{error}</p>}
        {success && <p className="text-sm text-accent-green">{success}</p>}
        <div className="flex gap-2">
          <Button type="button" disabled={loading || !amount} onClick={() => run('add')}>
            {loading ? '…' : '+ ADD FUNDS'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading || !amount}
            onClick={() => run('deduct')}
          >
            {loading ? '…' : '− DEDUCT'}
          </Button>
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-display text-[10px] font-bold text-text-secondary">ALL TEAMS</p>
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {teams.map((t) => (
            <li
              key={t.id}
              className="flex justify-between border-b border-border/30 pb-2 font-body text-sm last:border-0"
            >
              <span className="font-semibold">{t.name}</span>
              <span className="font-display text-accent-green">{t.balance}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
