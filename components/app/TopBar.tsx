import Link from 'next/link';
import { TeamRaceTimer } from '@/components/app/TeamRaceTimer';

interface TopBarProps {
  teamName?: string;
  balance?: number;
  raceStartedAt?: string | null;
  raceFinishedAt?: string | null;
}

export function TopBar({ teamName, balance, raceStartedAt, raceFinishedAt }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b-2 border-border bg-bg-primary px-4 py-3 text-on-bg-readable">
      <div className="min-w-0 flex-1">
        <p className="font-display text-[10px] font-bold text-text-on-bg-muted">TEAM</p>
        <p className="truncate font-display text-sm font-bold">{teamName ?? '—'}</p>
      </div>
      <TeamRaceTimer startedAt={raceStartedAt ?? null} finishedAt={raceFinishedAt ?? null} />
      {balance !== undefined && (
        <Link
          href="/bank"
          className="shrink-0 rounded-full border-2 border-border bg-bg-secondary px-3 py-1 font-display text-xs font-bold text-text-on-surface shadow-[inset_1px_1px_0_var(--color-win-highlight)]"
        >
          <span className="text-accent-green">{balance.toLocaleString('id-ID')}</span>
          <span className="text-text-on-surface"> EC</span>
        </Link>
      )}
    </header>
  );
}
