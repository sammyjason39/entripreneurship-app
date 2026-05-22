import { ArrowDownLeft, ArrowUpRight, Gift } from 'lucide-react';
import type { Transaction } from '@/lib/types';

interface TransactionItemProps {
  tx: Transaction;
  teamId: string;
}

export function TransactionItem({ tx, teamId }: TransactionItemProps) {
  const received = tx.to_team_id === teamId;
  const Icon = tx.type === 'reward' ? Gift : received ? ArrowDownLeft : ArrowUpRight;
  const sign = received ? '+' : '-';

  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-bg-secondary p-3">
      <Icon size={20} className={received ? 'text-accent-green' : 'text-accent-red'} />
      <div className="flex-1 min-w-0">
        <p className="truncate font-body text-sm">{tx.note ?? tx.type}</p>
        <p className="font-body text-[10px] text-text-secondary">
          {new Date(tx.created_at).toLocaleString('id-ID')}
        </p>
      </div>
      <p
        className={`font-display text-sm ${received ? 'text-accent-green' : 'text-accent-red'}`}
      >
        {sign}
        {tx.amount} EC
      </p>
    </div>
  );
}
