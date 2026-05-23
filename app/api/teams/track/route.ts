import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { isCompanySlug } from '@/lib/event-tracks';
import { startTeamRaceIfNeeded } from '@/lib/team-economy';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { company_track?: string };
  const slug = body.company_track?.trim().toLowerCase();
  if (!slug || !isCompanySlug(slug)) {
    return NextResponse.json({ error: 'Invalid track' }, { status: 400 });
  }

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_role, team_id, teams(id, ceo_id, company_track)')
    .eq('user_id', user.id)
    .maybeSingle();

  const teamRaw = membership?.teams;
  const teamRow = (Array.isArray(teamRaw) ? teamRaw[0] : teamRaw) as {
    id: string;
    ceo_id: string;
    company_track: string | null;
  } | null;

  if (!teamRow) {
    return NextResponse.json({ error: 'No team found' }, { status: 404 });
  }
  if (membership?.team_role !== 'CEO') {
    return NextResponse.json({ error: 'Only your CEO can choose the team track' }, { status: 403 });
  }

  const service = await createServiceClient();
  const { data: updated, error } = await service
    .from('teams')
    .update({ company_track: slug })
    .eq('id', teamRow.id)
    .select('id, name, company_track, race_started_at, race_finished_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await startTeamRaceIfNeeded(teamRow.id);

  const { data: refreshed } = await service
    .from('teams')
    .select('id, name, company_track, race_started_at, race_finished_at')
    .eq('id', teamRow.id)
    .single();

  return NextResponse.json({ ok: true, team: refreshed ?? updated });
}
