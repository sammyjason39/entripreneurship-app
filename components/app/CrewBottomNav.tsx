'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Map, Trophy, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CrewPermissions } from '@/lib/crew-permissions';

export function CrewBottomNav({ permissions }: { permissions: CrewPermissions }) {
  const pathname = usePathname();

  const tabs = [
    { href: '/crew', label: 'Home', icon: Home, show: true },
    { href: '/crew/pay', label: 'Pay', icon: Wallet, show: permissions.canPay },
    { href: '/crew/map', label: 'Map', icon: Map, show: permissions.canViewMap },
    { href: '/crew/leaderboard', label: 'Board', icon: Trophy, show: permissions.canViewLeaderboard },
    {
      href: '/crew/register',
      label: 'Register',
      icon: UserPlus,
      show: permissions.canRegisterParticipants,
    },
  ].filter((t) => t.show);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-border bg-bg-primary text-on-bg-readable">
      <div className="mx-auto flex max-w-[480px] justify-around py-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/crew'
              ? pathname === '/crew'
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 border-t-[3px] px-2 py-1 font-display text-[8px] font-bold uppercase sm:px-3 sm:text-[9px]',
                active
                  ? 'border-accent-green text-text-on-bg'
                  : 'border-transparent text-text-on-bg-muted'
              )}
            >
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
