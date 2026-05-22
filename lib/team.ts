import { createClient } from '@/lib/supabase/server';
import type { Team, TeamMember, Profile } from '@/lib/types';
import { cache } from 'react';

export const getTeamForUser = cache(async function getTeamForUser(userId: string) {
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from('team_members')
    .select('team_role, team_id, teams(*)')
    .eq('user_id', userId)
    .maybeSingle();

  if (!membership) return null;

  const teamRaw = membership.teams;
  const team = (Array.isArray(teamRaw) ? teamRaw[0] : teamRaw) as Team;
  const { data: members } = await supabase
    .from('team_members')
    .select('*, profiles(id, full_name)')
    .eq('team_id', membership.team_id);

  return {
    team,
    role: membership.team_role,
    members: (members ?? []) as (TeamMember & { profiles: Profile })[],
  };
});
