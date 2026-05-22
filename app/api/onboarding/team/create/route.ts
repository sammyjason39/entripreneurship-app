import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';
import { generateJoinCode } from '@/lib/utils';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const { name } = (await request.json()) as { name?: string };
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Team name required' }, { status: 400 });
  }

  const supabase = await createClient();
  const join_code = generateJoinCode();

  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .insert({ name: name.trim(), ceo_id: auth.userId, join_code })
    .select()
    .single();

  if (teamErr) return NextResponse.json({ error: teamErr.message }, { status: 500 });

  const { error: memberErr } = await supabase.from('team_members').insert({
    team_id: team.id,
    user_id: auth.userId,
    team_role: 'CEO',
  });

  if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 500 });
  return NextResponse.json({ team, join_code });
}
