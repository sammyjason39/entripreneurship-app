import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const { token } = (await request.json()) as { token?: string };
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, qr_token')
    .eq('qr_token', token)
    .single();

  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: member } = await supabase
    .from('team_members')
    .select('team_id, teams(id, name, balance)')
    .eq('user_id', profile.id)
    .maybeSingle();

  const teamsRaw = member?.teams;
  const team = Array.isArray(teamsRaw) ? teamsRaw[0] : teamsRaw;

  return NextResponse.json({
    profile,
    team: team ?? null,
    team_id: member?.team_id ?? null,
  });
}
