'use client';

import { useEffect, useState } from 'react';
import { formatRaceElapsed } from '@/lib/format-race-time';

export function TeamRaceTimer({
  startedAt,
  finishedAt,
}: {
  startedAt: string | null;
  finishedAt: string | null;
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!startedAt || finishedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt, finishedAt]);

  const label = formatRaceElapsed(startedAt, finishedAt, now);

  if (!label) {
    return (
      <p className="font-display text-[9px] text-text-on-bg-muted">
        TIMER — mulai setelah Pos 1 / pilih trek
      </p>
    );
  }

  return (
    <div className="text-right">
      <p className="font-display text-[9px] text-text-on-bg-muted">
        {finishedAt ? 'WAKTU FINISH' : 'TIMER'}
      </p>
      <p className="font-display text-sm font-bold tabular-nums text-accent-yellow">{label}</p>
    </div>
  );
}
