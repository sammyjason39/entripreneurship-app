import Link from 'next/link';

interface TopBarProps {
  teamName?: string;
  balance?: number;
}

export function TopBar({ teamName, balance }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b-2 border-border bg-bg-primary px-4 py-3 text-on-bg-readable">
      <div>
        <p className="font-display text-[10px] font-bold text-text-on-bg-muted">TEAM</p>
        <p className="font-display text-sm font-bold">{teamName ?? '—'}</p>
      </div>
      {balance !== undefined && (
        <Link
          href="/bank"
          className="rounded-full border-2 border-border bg-bg-secondary px-3 py-1 font-display text-xs font-bold text-text-on-surface shadow-[inset_1px_1px_0_var(--color-win-highlight)]"
        >
          <span className="text-accent-green">{balance.toLocaleString()}</span>
          <span className="text-text-on-surface"> EC</span>
          {balance.toLocaleString()} EC
        </Link>
      )}
    </header>
  );
}
