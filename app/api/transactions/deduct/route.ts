import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse, verifyUserPin } from '@/lib/api-helpers';
export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  if (auth.profile.app_role !== 'crew') {
    return NextResponse.json({ error: 'Crew only' }, { status: 403 });
  }

  const body = (await request.json()) as {
    pin: string;
    team_id: string;
    amount: number;
    note?: string;
  };

  const pinCheck = await verifyUserPin(auth.profile, body.pin);
  if (!pinCheck.ok) {
    return NextResponse.json({ error: pinCheck.error }, { status: pinCheck.status });
  }

  if (!body.team_id || !body.amount || body.amount <= 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: team } = await supabase.from('teams').select('id, name, balance').eq('id', body.team_id).single();
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  if (team.balance < body.amount) {
    return NextResponse.json({ error: 'Team does not have enough EnCoins' }, { status: 400 });
  }

  const { error } = await supabase.from('transactions').insert({
    from_user_id: auth.userId,
    from_team_id: body.team_id,
    to_team_id: body.team_id,
    amount: body.amount,
    type: 'spend',
    note: body.note ?? 'Crew deduction',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, team: { name: team.name, balance: team.balance - body.amount } });
}
