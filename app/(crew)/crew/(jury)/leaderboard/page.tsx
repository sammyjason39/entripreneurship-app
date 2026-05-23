'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { teamNameFromJoin } from '@/lib/supabase-helpers';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Tab = 'richest' | 'fastest' | 'innovative' | 'outfit';

export default function CrewLeaderboardPage() {
  const [tab, setTab] = useState<Tab>('richest');
  const [teams, setTeams] = useState<
    { id: string; name: string; balance: number; innovative_score: number | null; outfit_score: number | null }[]
  >([]);
  const [fastest, setFastest] = useState<{ name: string; submitted_at: string }[]>([]);
  const [scores, setScores] = useState<Record<string, { innovative: string; outfit: string }>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.from('teams').select('*').order('balance', { ascending: false }).then(({ data }) => {
      setTeams(data ?? []);
      const init: Record<string, { innovative: string; outfit: string }> = {};
      data?.forEach((t) => {
        init[t.id] = {
          innovative: t.innovative_score?.toString() ?? '',
          outfit: t.outfit_score?.toString() ?? '',
        };
      });
      setScores(init);
    });

    supabase.from('stations').select('id').eq('number', 7).single().then(({ data: pos7 }) => {
      if (!pos7) return;
      supabase
        .from('submissions')
        .select('submitted_at, teams(name)')
        .eq('station_id', pos7.id)
        .eq('status', 'approved')
        .order('submitted_at', { ascending: true })
        .then(({ data }) => {
          setFastest(
            data?.map((s) => ({
              name: teamNameFromJoin(s.teams),
              submitted_at: s.submitted_at,
            })) ?? []
          );
        });
    });
  }, []);

  const saveScore = async (teamId: string, field: 'innovative_score' | 'outfit_score', value: string) => {
    const num = parseInt(value, 10);
    if (num < 1 || num > 10) return;
    const supabase = createClient();
    await supabase.from('teams').update({ [field]: num }).eq('id', teamId);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'richest', label: 'Richest' },
    { id: 'fastest', label: 'Fastest' },
    { id: 'innovative', label: 'Innovative' },
    { id: 'outfit', label: 'Outfit' },
  ];

  return (
    <main className="p-4 space-y-4">
      <h1 className="font-display text-lg">LEADERBOARD</h1>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`font-display text-[9px] px-2 py-1 border rounded-card ${
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
            <span className="text-accent-green font-display text-xs">{t.balance} EC</span>
          </Card>
        ))}

      {tab === 'fastest' &&
        fastest.map((t, i) => (
          <Card key={`${t.name}-${i}`} className="flex justify-between">
            <span className="font-display text-xs">
              #{i + 1} {t.name}
            </span>
            <span className="text-text-secondary text-[10px]">
              {new Date(t.submitted_at).toLocaleString('id-ID')}
            </span>
          </Card>
        ))}

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
