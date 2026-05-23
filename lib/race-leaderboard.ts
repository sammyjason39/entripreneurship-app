import { formatRaceElapsed } from '@/lib/format-race-time';

export type RaceLeaderboardEntry = {
  id: string;
  name: string;
  race_started_at: string;
  race_finished_at: string | null;
  elapsedMs: number;
  timeLabel: string;
  status: 'finished' | 'racing';
};

type TeamRaceFields = {
  id: string;
  name: string;
  race_started_at: string | null;
  race_finished_at: string | null;
};

export function raceElapsedMs(
  startedAt: string,
  finishedAt: string | null,
  nowMs: number = Date.now()
): number {
  const start = new Date(startedAt).getTime();
  const end = finishedAt ? new Date(finishedAt).getTime() : nowMs;
  return Math.max(0, end - start);
}

/** Fastest = shortest race timer (Pos 1 / track start → Pos 7 finish). */
export function buildRaceLeaderboard(
  teams: TeamRaceFields[],
  nowMs: number = Date.now()
): RaceLeaderboardEntry[] {
  return teams
    .filter((t): t is TeamRaceFields & { race_started_at: string } => !!t.race_started_at)
    .map((t) => {
      const finished = !!t.race_finished_at;
      const elapsedMs = raceElapsedMs(t.race_started_at, t.race_finished_at, nowMs);
      return {
        id: t.id,
        name: t.name,
        race_started_at: t.race_started_at,
        race_finished_at: t.race_finished_at,
        elapsedMs,
        timeLabel: formatRaceElapsed(t.race_started_at, t.race_finished_at, nowMs) ?? '—',
        status: finished ? ('finished' as const) : ('racing' as const),
      };
    })
    .sort((a, b) => {
      if (a.status === 'finished' && b.status === 'finished') return a.elapsedMs - b.elapsedMs;
      if (a.status === 'finished' && b.status === 'racing') return -1;
      if (a.status === 'racing' && b.status === 'finished') return 1;
      return a.elapsedMs - b.elapsedMs;
    });
}

export function finishedRaceLeaderboard(entries: RaceLeaderboardEntry[]): RaceLeaderboardEntry[] {
  return entries.filter((e) => e.status === 'finished');
}
