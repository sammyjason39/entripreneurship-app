import { createClient } from '@/lib/supabase/server';
import { trackLabel } from '@/lib/event-tracks';
import { formatRaceElapsed } from '@/lib/format-race-time';
import type { CompanySlug } from '@/lib/content-types';
import { isCompanySlug } from '@/lib/event-tracks';
import { profileNameFromJoin } from '@/lib/supabase-helpers';

export type TeamOverviewRow = {
  id: string;
  name: string;
  balance: number;
  company_track: string | null;
  company_label: string;
  member_count: number;
  members: { role: string; name: string }[];
  race_started_at: string | null;
  race_finished_at: string | null;
  race_time_label: string | null;
};

export async function listTeamsOverview(): Promise<TeamOverviewRow[]> {
  const supabase = await createClient();
  const { data: teams } = await supabase.from('teams').select('*').order('name');

  const rows = await Promise.all(
    (teams ?? []).map(async (team) => {
      const { data: members } = await supabase
        .from('team_members')
        .select('team_role, profiles(full_name)')
        .eq('team_id', team.id);

      const slug =
        team.company_track && isCompanySlug(team.company_track)
          ? (team.company_track as CompanySlug)
          : null;

      return {
        id: team.id,
        name: team.name,
        balance: team.balance,
        company_track: team.company_track,
        company_label: slug ? trackLabel(slug) : '— belum pilih',
        member_count: members?.length ?? 0,
        members:
          members?.map((m) => ({
            role: m.team_role,
            name: profileNameFromJoin(m.profiles),
          })) ?? [],
        race_started_at: team.race_started_at,
        race_finished_at: team.race_finished_at,
        race_time_label: formatRaceElapsed(team.race_started_at, team.race_finished_at),
      };
    })
  );

  return rows;
}
