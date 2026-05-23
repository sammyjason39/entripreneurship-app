'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LogoutButton } from '@/components/app/LogoutButton';

const links = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/participants', label: 'Participants' },
  { href: '/admin/teams', label: 'Teams' },
  { href: '/admin/crew', label: 'Crew & jury' },
  { href: '/crew/submissions', label: 'Submissions' },
  { href: '/crew/leaderboard', label: 'Leaderboard' },
  { href: '/crew/teams', label: 'Teams' },
  { href: '/crew/tracking', label: 'Team movement' },
  { href: '/crew/map', label: 'Live map' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-bg-primary text-on-bg-readable">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-[10px] font-bold text-text-on-bg-muted">JURY CONSOLE</p>
          <p className="font-display text-sm font-bold">EnTripreneurship Vol. 02</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <nav className="flex flex-wrap gap-1">
          {links.map(({ href, label, exact }) => {
            const active = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded border px-2 py-1 font-display text-[9px] font-bold uppercase',
                  active
                    ? 'border-accent-green bg-bg-secondary text-text-on-surface'
                    : 'border-border text-text-on-bg-muted'
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <LogoutButton />
        </div>
      </div>
    </header>
  );
}
