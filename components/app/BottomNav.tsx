'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Wallet, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/missions', label: 'Missions', icon: Target },
  { href: '/bank', label: 'Bank', icon: Wallet },
  { href: '/profile', label: 'More', icon: Menu },
];

export function BottomNav() {
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
                active ? 'text-accent-green drop-shadow-[0_0_8px_#4ade80]' : 'text-text-secondary'
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
