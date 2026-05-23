'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { buildRaceLeaderboard, type RaceLeaderboardEntry } from '@/lib/race-leaderboard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Tab = 'richest' | 'fastest' | 'innovative' | 'outfit';

type TeamRow = {
  id: string;
  name: string;
  balance: number;
  innovative_score: number | null;
  outfit_score: number | null;
  race_started_at: string | null;
  race_finished_at: string | null;
};

export default function CrewLeaderboardPage() {
  const [tab, setTab] = useState<Tab>('richest');
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [fastest, setFastest] = useState<RaceLeaderboardEntry[]>([]);
  const [scores, setScores] = useState<Record<string, { innovative: string; outfit: string }>>({});

  const load = () => {
    const supabase = createClient();
    supabase
      .from('teams')
      .select('id, name, balance, innovative_score, outfit_score, race_started_at, race_finished_at')
      .order('balance', { ascending: false })
      .then(({ data }) => {
        const rows = (data ?? []) as TeamRow[];
        setTeams(rows);
        setFastest(buildRaceLeaderboard(rows));
        const init: Record<string, { innovative: string; outfit: string }> = {};
        rows.forEach((t) => {
          init[t.id] = {
            innovative: t.innovative_score?.toString() ?? '',
            outfit: t.outfit_score?.toString() ?? '',
          };
        });
        setScores(init);
      });
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  const saveScore = async (teamId: string, field: 'innovative_score' | 'outfit_score', value: string) => {
    const num = parseInt(value, 10);
    if (num < 1 || num > 10) return;
    const supabase = createClient();
    await supabase.from('teams').update({ [field]: num }).eq('id', teamId);
    load();
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'richest', label: 'Richest' },
    { id: 'fastest', label: 'Fastest' },
    { id: 'innovative', label: 'Innovative' },
    { id: 'outfit', label: 'Outfit' },
  ];

  return (
    <main className="space-y-4 p-4">
      <h1 className="font-display text-lg">LEADERBOARD</h1>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-card border px-2 py-1 font-display text-[9px] ${
              tab === t.id ? 'border-accent-blue text-accent-blue' : 'border-border'
            }`}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'richest' &&
        teams.map((t, i) => (
          <Card key={t.id} className="flex justify-between">
            <span className="font-display text-xs">
              #{i + 1} {t.name}
            </span>
            <span className="font-display text-xs text-accent-green">{t.balance} EC</span>
          </Card>
        ))}

      {tab === 'fastest' && (
        <>
          <p className="font-body text-[10px] text-text-secondary">
            Race timer — start trek sampai finish Pos 7. Tim selesai di atas; (berlari) = masih di track.
          </p>
          {fastest.map((t, i) => (
            <Card key={t.id} className="flex justify-between">
              <span className="font-display text-xs">
                #{i + 1} {t.name}
                {t.status === 'racing' && (
                  <span className="ml-1 font-body text-[9px] text-accent-yellow">(berlari)</span>
                )}
              </span>
              <span className="font-display text-xs text-accent-blue">{t.timeLabel}</span>
            </Card>
          ))}
          {fastest.length === 0 && (
            <p className="text-sm text-text-secondary">Belum ada tim yang memulai race timer</p>
          )}
        </>
      )}

      {tab === 'innovative' &&
        teams
          .sort((a, b) => (b.innovative_score ?? 0) - (a.innovative_score ?? 0))
          .map((t) => (
            <Card key={t.id} className="space-y-2">
              <p className="font-display text-xs">{t.name}</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  max={10}
                  placeholder="1-10"
                  value={scores[t.id]?.innovative ?? ''}
                  onChange={(e) =>
                    setScores((s) => ({
                      ...s,
                      [t.id]: { ...s[t.id], innovative: e.target.value, outfit: s[t.id]?.outfit ?? '' },
                    }))
                  }
                />
                <Button size="sm" onClick={() => saveScore(t.id, 'innovative_score', scores[t.id]?.innovative ?? '')}>
                  SAVE
                </Button>
              </div>
            </Card>
          ))}

      {tab === 'outfit' &&
        teams
          .sort((a, b) => (b.outfit_score ?? 0) - (a.outfit_score ?? 0))
          .map((t) => (
            <Card key={t.id} className="space-y-2">
              <p className="font-display text-xs">{t.name}</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={scores[t.id]?.outfit ?? ''}
                  onChange={(e) =>
                    setScores((s) => ({
                      ...s,
                      [t.id]: { innovative: s[t.id]?.innovative ?? '', outfit: e.target.value },
                    }))
                  }
                />
                <Button size="sm" onClick={() => saveScore(t.id, 'outfit_score', scores[t.id]?.outfit ?? '')}>
                  SAVE
                </Button>
              </div>
            </Card>
          ))}
    </main>
  );
}
