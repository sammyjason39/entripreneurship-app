import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { buildRaceLeaderboard } from '@/lib/race-leaderboard';

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, balance, race_started_at, race_finished_at');

  const richest = [...(teams ?? [])].sort((a, b) => b.balance - a.balance).slice(0, 20);
  const fastest = buildRaceLeaderboard(teams ?? []);

  return (
    <main className="space-y-6 p-4">
      <h1 className="font-display text-lg">LEADERBOARD</h1>
      <section>
        <p className="mb-2 font-display text-[10px] text-accent-yellow">THE RICHEST</p>
        <div className="space-y-2">
          {richest.map((t, i) => (
            <Card key={t.id} className="flex justify-between py-2">
              <span className="font-display text-xs">
                #{i + 1} {t.name}
              </span>
              <span className="font-display text-xs text-accent-green">{t.balance} EC</span>
            </Card>
          ))}
        </div>
      </section>
      <section>
        <p className="mb-2 font-display text-[10px] text-accent-blue">THE FASTEST</p>
        <p className="mb-2 font-body text-[10px] text-text-secondary">
          Race timer — dari start trek (Pos 1 / pilih company) sampai selesai di Pos 7.
        </p>
        <div className="space-y-2">
          {fastest.map((t, i) => (
            <Card key={t.id} className="flex justify-between py-2">
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
        </div>
      </section>
    </main>
  );
}
