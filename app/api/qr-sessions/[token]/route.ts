import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const { token } = await params;
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from('qr_sessions')
    .select('*, profiles:initiator_id(full_name, app_role)')
    .eq('token', token)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  if (new Date(session.expires_at) < new Date() && session.status === 'pending') {
    await supabase.from('qr_sessions').update({ status: 'expired' }).eq('id', session.id);
    return NextResponse.json({ error: 'QR expired' }, { status: 410 });
  }

  let teamName: string | null = null;
  let teamId: string | null = null;
  const { data: member } = await supabase
    .from('team_members')
    .select('team_id, teams(name)')
    .eq('user_id', session.initiator_id)
    .maybeSingle();

  if (member) {
    teamId = member.team_id;
    const teams = member.teams as { name: string } | { name: string }[] | null;
    if (teams) {
      teamName = Array.isArray(teams) ? teams[0]?.name : teams.name;
    }
  }

  return NextResponse.json({ ...session, team_name: teamName, team_id: teamId });
}
