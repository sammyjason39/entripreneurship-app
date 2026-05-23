import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { ReviewActions } from '@/components/app/ReviewActions';
import { notFound } from 'next/navigation';
import { profileNameFromJoin } from '@/lib/supabase-helpers';
import { trackLabel, isCompanySlug } from '@/lib/event-tracks';
import { formatRaceElapsed } from '@/lib/format-race-time';
import type { CompanySlug } from '@/lib/content-types';

export default async function CrewTeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase.from('teams').select('*').eq('id', id).single();
  if (!team) notFound();

  const { data: members } = await supabase
    .from('team_members')
    .select('team_role, profiles(full_name)')
    .eq('team_id', id);

  const { data: stations } = await supabase.from('stations').select('*').order('number');
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, stations(name, number)')
    .eq('team_id', id);

  const subByStation = new Map(submissions?.map((s) => [s.station_id, s]) ?? []);

  return (
    <main className="p-4 space-y-6">
      <div>
        <h1 className="font-display text-xl">{team.name}</h1>
        <p className="font-display text-xs text-accent-yellow">CODE: {team.join_code}</p>
        <p className="font-display text-lg text-accent-green mt-2">{team.balance} EC</p>
        <p className="mt-2 font-body text-sm">
          Trek:{' '}
          <strong>
            {team.company_track && isCompanySlug(team.company_track)
              ? trackLabel(team.company_track as CompanySlug)
              : 'Belum dipilih'}
          </strong>
        </p>
        <p className="font-display text-sm tabular-nums text-accent-yellow">
          Timer: {formatRaceElapsed(team.race_started_at, team.race_finished_at) ?? '—'}
          {team.race_finished_at ? ' (finish)' : ''}
        </p>
      </div>

      <Card>
        <p className="font-display text-[10px] text-text-secondary mb-2">
          MEMBERS ({members?.length ?? 0}/4)
        </p>
        {members?.map((m) => (
          <p key={m.team_role} className="font-body text-sm">
            {profileNameFromJoin(m.profiles)} — {m.team_role}
          </p>
        ))}
      </Card>

      <div className="space-y-4">
        <p className="font-display text-sm">SUBMISSIONS</p>
        {stations?.map((st) => {
          const sub = subByStation.get(st.id);
          return (
            <Card key={st.id}>
              <p className="font-display text-xs">
                Pos {st.number}: {st.name}
              </p>
              <p className="text-[10px] text-text-secondary mt-1">
                {sub?.status ?? 'not submitted'}
              </p>
              {sub && (
                <>
                  <pre className="mt-2 text-[10px] font-body whitespace-pre-wrap max-h-32 overflow-auto">
                    {JSON.stringify(sub.form_data, null, 2)}
                  </pre>
                  {sub.image_url && (
                    <a href={sub.image_url} className="text-accent-blue text-xs block mt-2">
                      View image
                    </a>
                  )}
                  {sub.status === 'pending' && <ReviewActions submissionId={sub.id} />}
                </>
              )}
            </Card>
          );
        })}
      </div>
    </main>
  );
}
