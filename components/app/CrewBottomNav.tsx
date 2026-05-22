'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, FileCheck, Map, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/crew/teams', label: 'Teams', icon: Users },
  { href: '/crew/submissions', label: 'Review', icon: FileCheck },
  { href: '/crew/map', label: 'Map', icon: Map },
  { href: '/crew/leaderboard', label: 'Board', icon: Trophy },
];

export function CrewBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg-primary">
      <div className="mx-auto flex max-w-[480px] justify-around py-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 font-display text-[9px] uppercase',
                active ? 'text-accent-blue' : 'text-text-secondary'
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
