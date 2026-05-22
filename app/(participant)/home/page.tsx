import Link from 'next/link';
import { requireParticipant } from '@/lib/auth';
import { getTeamForUser } from '@/lib/team';
import { createClient } from '@/lib/supabase/server';
import { BalanceCard } from '@/components/app/BalanceCard';
import { QuickActionGrid } from '@/components/app/QuickActionGrid';
import { SponsorRow } from '@/components/app/SponsorRow';
import { TransactionItem } from '@/components/app/TransactionItem';
import { Card } from '@/components/ui/card';

export default async function HomePage() {
  const { user, profile } = await requireParticipant();
  const teamData = await getTeamForUser(user.id);
  const supabase = await createClient();

  let activeMission = 'Complete your first station!';
  if (teamData) {
    const { data: stations } = await supabase.from('stations').select('id, number, name').order('number');
    const { data: subs } = await supabase
      .from('submissions')
      .select('station_id, status')
      .eq('team_id', teamData.team.id);

    const subMap = new Map(subs?.map((s) => [s.station_id, s.status]) ?? []);
    const next = stations?.find((st) => subMap.get(st.id) !== 'approved');
    if (next) activeMission = `Pos ${next.number}: ${next.name}`;
  }

  const { data: transactions } = teamData
    ? await supabase
        .from('transactions')
        .select('*')
        .or(`to_team_id.eq.${teamData.team.id},from_team_id.eq.${teamData.team.id}`)
        .order('created_at', { ascending: false })
        .limit(3)
    : { data: [] };

  return (
    <main className="space-y-6 p-4">
      <div>
        <h1 className="font-display text-lg">
          HELLO, {profile.full_name.split(' ')[0].toUpperCase()}
        </h1>
        {teamData && (
          <span className="mt-1 inline-block rounded border-2 border-border bg-bg-secondary px-2 py-0.5 font-display text-[10px] font-bold text-text-on-surface">
            {teamData.team.name}
          </span>
        )}
      </div>

      {teamData && <BalanceCard balance={teamData.team.balance} large />}

      <QuickActionGrid />

      <Card>
        <p className="font-display text-[10px] text-text-secondary">ACTIVE MISSION</p>
        <p className="mt-2 font-body text-sm">{activeMission}</p>
        <Link href="/missions" className="mt-2 inline-block font-display text-xs font-bold text-accent-green underline">
          VIEW ALL →
        </Link>
      </Card>

      {transactions && transactions.length > 0 && (
        <div className="space-y-2">
          <p className="font-display text-[10px] font-bold text-text-on-bg-muted">RECENT</p>
          {transactions.map((tx) => (
            <TransactionItem key={tx.id} tx={tx} teamId={teamData!.team.id} />
          ))}
        </div>
      )}

      <SponsorRow />
    </main>
  );
}
