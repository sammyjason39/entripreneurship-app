'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import type { TeamMovementStatus } from '@/lib/station-visits';

export function TeamTrackingBoard() {
  const [teams, setTeams] = useState<TeamMovementStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch('/api/stations/tracking');
    const data = await res.json();
    if (res.ok) setTeams(data.teams ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return <p className="animate-blink font-display text-xs">LOADING MOVEMENT…</p>;
  }

  const atStation = teams.filter((t) => t.currentStation);
  const elsewhere = teams.filter((t) => !t.currentStation && t.previousStation);

  return (
    <div className="space-y-4">
      <section>
        <h2 className="font-display text-sm text-accent-green">AT A STATION ({atStation.length})</h2>
        <div className="mt-2 space-y-2">
          {atStation.map((t) => (
            <Card key={t.teamId}>
              <p className="font-display text-xs">{t.teamName}</p>
              <p className="font-body text-sm">
                At <strong>Pos {t.currentStation!.number}</strong> — {t.currentStation!.name}
              </p>
              {t.previousStation && t.minutesSinceLeft != null && (
                <p className="font-body text-[10px] text-text-secondary">
                  Left Pos {t.previousStation.number} ({t.previousStation.name}) {t.minutesSinceLeft}{' '}
                  min ago
                </p>
              )}
            </Card>
          ))}
          {atStation.length === 0 && (
            <p className="text-sm text-text-secondary">No teams currently checked in.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-sm text-accent-yellow">IN TRANSIT / IDLE ({elsewhere.length})</h2>
        <div className="mt-2 space-y-2">
          {elsewhere.map((t) => (
            <Card key={t.teamId}>
              <p className="font-display text-xs">{t.teamName}</p>
              {t.previousStation ? (
                <p className="font-body text-sm text-text-secondary">
                  Last at Pos {t.previousStation.number}
                  {t.minutesSinceLeft != null ? ` — ${t.minutesSinceLeft} min ago` : ''}
                </p>
              ) : (
                <p className="font-body text-sm text-text-secondary">No station visits yet</p>
              )}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
