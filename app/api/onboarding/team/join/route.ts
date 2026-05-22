import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';
import { MAX_TEAM_SIZE } from '@/lib/types';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const { join_code, team_role } = (await request.json()) as {
    join_code?: string;
    team_role?: string;
  };

  if (!join_code || !team_role) {
    return NextResponse.json({ error: 'Code and role required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('join_code', join_code.toUpperCase())
    .single();

  if (!team) return NextResponse.json({ error: 'Invalid join code' }, { status: 404 });

  const { count } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', team.id);

  if ((count ?? 0) >= MAX_TEAM_SIZE) {
    return NextResponse.json({ error: 'Team is full' }, { status: 400 });
  }

  const { error } = await supabase.from('team_members').insert({
    team_id: team.id,
    user_id: auth.userId,
    team_role,
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Role taken or already joined' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ team_id: team.id });
}
