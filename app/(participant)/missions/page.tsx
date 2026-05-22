import { requireParticipant } from '@/lib/auth';
import { getTeamForUser } from '@/lib/team';
import { createClient } from '@/lib/supabase/server';
import { StationCard } from '@/components/app/StationCard';
import type { SubmissionStatus } from '@/lib/types';

export default async function MissionsPage() {
  const { user } = await requireParticipant();
  const teamData = await getTeamForUser(user.id);
  const supabase = await createClient();

  const { data: stations } = await supabase.from('stations').select('*').order('number');

  const subMap = new Map<string, SubmissionStatus>();
  if (teamData) {
    const { data: subs } = await supabase
      .from('submissions')
      .select('station_id, status')
      .eq('team_id', teamData.team.id);
    subs?.forEach((s) => subMap.set(s.station_id, s.status as SubmissionStatus));
  }

  return (
    <main className="space-y-4 p-4">
      <h1 className="font-display text-lg">MISSIONS</h1>
      <p className="font-body text-xs text-text-secondary">7 Design Thinking stations</p>
      <div className="space-y-3">
        {stations?.map((st) => {
          const status = subMap.get(st.id);
          let badge: SubmissionStatus | 'in_progress' = 'in_progress';
          if (!status) badge = 'in_progress';
          else badge = status;
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
