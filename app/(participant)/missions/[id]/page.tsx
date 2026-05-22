import { requireParticipant } from '@/lib/auth';
import { getTeamForUser } from '@/lib/team';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { SubmissionForm } from '@/components/app/SubmissionForm';
import { notFound } from 'next/navigation';

export default async function MissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireParticipant();
  const teamData = await getTeamForUser(user.id);
  const supabase = await createClient();

  const { data: station } = await supabase.from('stations').select('*').eq('id', id).single();
  if (!station) notFound();

  const isCeo = teamData?.role === 'CEO';
  let submission = null;
  if (teamData) {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('team_id', teamData.team.id)
      .eq('station_id', id)
      .maybeSingle();
    submission = data;
  }

  const ceoMember = teamData?.members.find((m) => m.team_role === 'CEO');

  return (
    <main className="space-y-4 p-4">
      <div>
        <p className="font-display text-accent-green text-xs">POS {station.number}</p>
        <h1 className="font-display text-lg">{station.name}</h1>
        <p className="font-body text-sm text-text-secondary mt-2">{station.activity_description}</p>
      </div>

      {!isCeo && (
        <Card className="border-accent-yellow/50">
          <p className="font-body text-sm">
            Only your CEO can submit for the team
            {ceoMember ? ` (${ceoMember.profiles?.full_name})` : ''}.
          </p>
        </Card>
      )}

      {submission?.status === 'pending' && (
        <Card>
          <p className="font-display text-accent-blue text-xs">AWAITING CREW REVIEW</p>
          <pre className="mt-2 font-body text-xs whitespace-pre-wrap">
            {JSON.stringify(submission.form_data, null, 2)}
          </pre>
        </Card>
      )}

      {submission?.status === 'approved' && (
        <Card className="border-accent-green/50">
          <p className="font-display text-accent-green">APPROVED ✓</p>
          <p className="text-sm mt-2">+{station.point_reward} EnCoins earned</p>
        </Card>
      )}

      {submission?.status === 'rejected' && isCeo && (
        <Card className="border-accent-red/50 space-y-4">
          <p className="font-display text-accent-red">REJECTED</p>
          <p className="text-sm">{submission.rejection_note}</p>
          <SubmissionForm
            station={station}
            teamId={teamData!.team.id}
            userId={user.id}
            existingId={submission.id}
          />
        </Card>
      )}

      {isCeo && teamData && !submission && (
        <SubmissionForm station={station} teamId={teamData.team.id} userId={user.id} />
      )}
    </main>
  );
}
