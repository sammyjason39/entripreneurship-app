'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TransactionItem } from '@/components/app/TransactionItem';
import type { Transaction } from '@/lib/types';
import { cn } from '@/lib/utils';

const filters = ['all', 'received', 'spent'] as const;

export default function BankHistoryPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [teamId, setTeamId] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: member } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single();
      if (!member) return;
      setTeamId(member.team_id);
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .or(`to_team_id.eq.${member.team_id},from_team_id.eq.${member.team_id}`)
        .order('created_at', { ascending: false });
      setTxs((data as Transaction[]) ?? []);
    };
    load();
  }, []);

  const filtered = txs.filter((tx) => {
    if (filter === 'all') return true;
    const received = tx.to_team_id === teamId;
    return filter === 'received' ? received : !received;
  });

  return (
    <main className="p-4 space-y-4">
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-card px-3 py-1 font-display text-[9px] uppercase border',
              filter === f
                ? 'border-accent-green text-accent-green'
                : 'border-border text-text-secondary'
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((tx) => (
          <TransactionItem key={tx.id} tx={tx} teamId={teamId} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-text-secondary text-sm">No transactions yet</p>
        )}
      </div>
    </main>
  );
}
