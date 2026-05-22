import { createClient } from '@/lib/supabase/server';
import { teamNameFromJoin } from '@/lib/supabase-helpers';
import { Card } from '@/components/ui/card';

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data: richest } = await supabase
    .from('teams')
    .select('name, balance')
    .order('balance', { ascending: false })
    .limit(20);

  const { data: pos7 } = await supabase.from('stations').select('id').eq('number', 7).single();
  let fastest: { name: string; submitted_at: string }[] = [];
  if (pos7) {
    const { data: subs } = await supabase
      .from('submissions')
      .select('submitted_at, teams(name)')
      .eq('station_id', pos7.id)
      .eq('status', 'approved')
      .order('submitted_at', { ascending: true })
      .limit(20);
    fastest =
      subs?.map((s) => ({
        name: teamNameFromJoin(s.teams),
        submitted_at: s.submitted_at,
      })) ?? [];
  }

  return (
    <main className="p-4 space-y-6">
      <h1 className="font-display text-lg">LEADERBOARD</h1>
      <section>
        <p className="font-display text-[10px] text-accent-yellow mb-2">THE RICHEST</p>
        <div className="space-y-2">
          {richest?.map((t, i) => (
            <Card key={t.name} className="flex justify-between py-2">
              <span className="font-display text-xs">
                #{i + 1} {t.name}
              </span>
              <span className="text-accent-green font-display text-xs">{t.balance} EC</span>
            </Card>
          ))}
        </div>
      </section>
      <section>
        <p className="font-display text-[10px] text-accent-blue mb-2">THE FASTEST</p>
        <div className="space-y-2">
          {fastest.map((t, i) => (
            <Card key={`${t.name}-${i}`} className="flex justify-between py-2">
              <span className="font-display text-xs">
                #{i + 1} {t.name}
              </span>
              <span className="text-text-secondary font-body text-[10px]">
                {new Date(t.submitted_at).toLocaleTimeString('id-ID')}
              </span>
            </Card>
          ))}
          {fastest.length === 0 && (
            <p className="text-text-secondary text-sm">No completions yet</p>
          )}
        </div>
      </section>
    </main>
  );
}
