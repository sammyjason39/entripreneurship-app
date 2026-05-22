import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse, verifyUserPin } from '@/lib/api-helpers';
import { teamBalanceFromJoin } from '@/lib/supabase-helpers';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const body = (await request.json()) as {
    pin: string;
    to_team_id: string;
    amount: number;
    note?: string;
  };

  const pinCheck = await verifyUserPin(auth.profile, body.pin);
  if (!pinCheck.ok) {
    return NextResponse.json({ error: pinCheck.error }, { status: pinCheck.status });
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from('team_members')
    .select('team_id, teams(balance)')
    .eq('user_id', auth.userId)
    .single();

  if (!member) return NextResponse.json({ error: 'No team' }, { status: 400 });

  const balance = teamBalanceFromJoin(member.teams);
  if (balance < body.amount) {
    return NextResponse.json({ error: 'Not enough EnCoins' }, { status: 400 });
  }

  const { error } = await supabase.from('transactions').insert({
    from_user_id: auth.userId,
    from_team_id: member.team_id,
    to_team_id: body.to_team_id,
    amount: body.amount,
    type: 'transfer',
    note: body.note ?? 'Transfer',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
