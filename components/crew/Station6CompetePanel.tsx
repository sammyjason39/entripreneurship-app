'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatMs, formatRaceElapsed } from '@/lib/format-race-time';

type ActiveVisit = {
  id: string;
  team_id: string;
  checked_in_at: string;
  teams?: { name: string } | { name: string }[] | null;
};

function teamName(teams: ActiveVisit['teams']): string {
  if (!teams) return 'Team';
  return Array.isArray(teams) ? teams[0]?.name ?? 'Team' : teams.name;
}

type CompeteRun = {
  id: string;
  started_at: string;
  ended_at?: string | null;
  elapsed_ms?: number | null;
};

export function Station6CompetePanel({ visits }: { visits: ActiveVisit[] }) {
  const [runs, setRuns] = useState<Record<string, CompeteRun | null>>({});
  const [liveMs, setLiveMs] = useState(Date.now());
  const [loading, setLoading] = useState<string | null>(null);

  const loadTeam = useCallback(async (teamId: string) => {
    const res = await fetch(`/api/stations/compete?teamId=${encodeURIComponent(teamId)}`);
    const data = await res.json();
    if (res.ok) {
      setRuns((r) => ({ ...r, [teamId]: data.active ?? null }));
    }
  }, []);

  useEffect(() => {
    visits.forEach((v) => loadTeam(v.team_id));
  }, [visits, loadTeam]);

  useEffect(() => {
    const hasActive = Object.values(runs).some((r) => r && !r.ended_at);
    if (!hasActive) return;
    const id = setInterval(() => setLiveMs(Date.now()), 500);
    return () => clearInterval(id);
  }, [runs]);

  const start = async (teamId: string) => {
    setLoading(teamId);
    const res = await fetch('/api/stations/compete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: teamId, action: 'start' }),
    });
    setLoading(null);
    if (res.ok) await loadTeam(teamId);
  };

  const stop = async (teamId: string, runId: string) => {
    setLoading(runId);
    await fetch('/api/stations/compete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: teamId, action: 'stop', run_id: runId }),
    });
    setLoading(null);
    await loadTeam(teamId);
  };

  if (visits.length === 0) return null;

  return (
    <Card className="border-accent-yellow/50 space-y-3">
      <p className="font-display text-xs text-accent-yellow">POS 6 — COMPETE TIMER</p>
      <p className="font-body text-[10px] text-text-secondary">
        Start/stop stopwatch saat tim compete di station ini.
      </p>
      {visits.map((v) => {
        const run = runs[v.team_id];
        const live =
          run && !run.ended_at
            ? formatRaceElapsed(run.started_at, null, liveMs)
            : run?.elapsed_ms != null
              ? formatMs(run.elapsed_ms)
              : null;

        return (
          <div
            key={v.id}
            className="flex flex-wrap items-center justify-between gap-2 border-t border-border/30 pt-2 first:border-0 first:pt-0"
          >
            <div>
              <p className="font-display text-xs">{teamName(v.teams)}</p>
              {live && (
                <p className="font-display text-lg tabular-nums text-accent-green">{live}</p>
              )}
            </div>
            <div className="flex gap-2">
              {!run ? (
                <Button size="sm" disabled={loading === v.team_id} onClick={() => start(v.team_id)}>
                  START
                </Button>
              ) : !run.ended_at ? (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={loading === run.id}
                  onClick={() => stop(v.team_id, run.id)}
                >
                  STOP
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled={loading === v.team_id} onClick={() => start(v.team_id)}>
                  AGAIN
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
