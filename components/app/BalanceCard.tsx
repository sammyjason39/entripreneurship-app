'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatEnCoins } from '@/lib/utils';

interface BalanceCardProps {
  balance: number;
  teamName?: string;
  large?: boolean;
}

export function BalanceCard({ balance, teamName, large }: BalanceCardProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const from = display;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(from + (balance - from) * p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance]);

  return (
    <Card
      className={`scanlines relative overflow-hidden border-accent-green/40 ${
        large ? 'p-6' : 'p-4'
      } animate-count-glow`}
    >
      {teamName && (
        <p className="mb-1 font-body text-xs text-text-secondary">{teamName}</p>
      )}
      <p className="font-display text-[10px] text-text-secondary">ENCOINS BALANCE</p>
      <p
        className={`font-display text-accent-green ${
          large ? 'text-4xl' : 'text-2xl'
        }`}
      >
        {formatEnCoins(display)}
      </p>
    </Card>
  );
}
