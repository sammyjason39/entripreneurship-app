import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';

export default async function CrewTeamsPage() {
  const supabase = await createClient();
  const { data: teams } = await supabase.from('teams').select('*').order('name');

  const enriched = await Promise.all(
    (teams ?? []).map(async (team) => {
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id);
      const { count: approved } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id)
        .eq('status', 'approved');
      return { ...team, members: count ?? 0, completed: approved ?? 0 };
    })
  );

  return (
    <main className="p-4 space-y-4">
      <h1 className="font-display text-lg">TEAMS</h1>
      {enriched.map((t) => (
        <Link key={t.id} href={`/crew/teams/${t.id}`}>
          <Card className="flex justify-between items-center btn-press">
            <div>
              <p className="font-display text-sm">{t.name}</p>
              <p className="font-body text-[10px] text-text-secondary">
                {t.members} members · {t.completed}/7 stations
              </p>
            </div>
            <p className="font-display text-accent-green">{t.balance} EC</p>
          </Card>
        </Link>
      ))}
    </main>
  );
}
