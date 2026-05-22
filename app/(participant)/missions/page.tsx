import Link from 'next/link';
import { requireParticipant } from '@/lib/auth';
import { getTeamForUser } from '@/lib/team';
import { createClient } from '@/lib/supabase/server';
import { StationCard } from '@/components/app/StationCard';
import { Button } from '@/components/ui/button';
import type { SubmissionStatus } from '@/lib/types';

export default async function MissionsPage() {
  const { user } = await requireParticipant();
  const teamData = await getTeamForUser(user.id);
  const supabase = await createClient();

  const { data: stations } = await supabase.from('stations').select('*').order('number');

  const subMap = new Map<string, SubmissionStatus>();
  const visitMap = new Map<string, 'checked_in'>();
  if (teamData) {
    const { data: subs } = await supabase
      .from('submissions')
      .select('station_id, status')
      .eq('team_id', teamData.team.id);
    subs?.forEach((s) => subMap.set(s.station_id, s.status as SubmissionStatus));

    const { data: visits } = await supabase
      .from('station_visits')
      .select('station_id')
      .eq('team_id', teamData.team.id)
      .eq('status', 'active');
    visits?.forEach((v) => visitMap.set(v.station_id, 'checked_in'));
  }

  return (
    <main className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-lg font-bold">MISSIONS</h1>
          <p className="font-body text-xs font-semibold text-text-on-bg-muted">
            Scan QR at each Pos, then CEO submits
          </p>
        </div>
        <Link href="/missions/scan">
          <Button className="shrink-0 text-xs">SCAN QR</Button>
        </Link>
      </div>
      <div className="space-y-3">
        {stations?.map((st) => {
          const subStatus = subMap.get(st.id);
          let badge: SubmissionStatus | 'in_progress' | 'locked' | 'checked_in' = 'in_progress';
          if (visitMap.has(st.id) && !subStatus) badge = 'checked_in';
          else if (!subStatus) badge = 'in_progress';
          else badge = subStatus;
          return (
            <StationCard
              key={st.id}
              id={st.id}
              number={st.number}
              name={st.name}
              activityType={st.activity_type}
              status={badge}
            />
          );
        })}
      </div>
    </main>
  );
}
