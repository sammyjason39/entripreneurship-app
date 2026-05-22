import Link from 'next/link';

interface TopBarProps {
  teamName?: string;
  balance?: number;
}

export function TopBar({ teamName, balance }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-bg-primary/95 px-4 py-3 backdrop-blur">
      <div>
        <p className="font-display text-[10px] text-text-secondary">TEAM</p>
        <p className="font-display text-sm text-text-primary">{teamName ?? '—'}</p>
      </div>
      {balance !== undefined && (
        <Link
          href="/bank"
          className="rounded-full border border-accent-green/50 bg-bg-secondary px-3 py-1 font-display text-xs text-accent-green"
        >
          {balance.toLocaleString()} EC
        </Link>
      )}
    </header>
  );
}
