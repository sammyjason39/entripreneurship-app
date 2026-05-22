import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse, verifyUserPin } from '@/lib/api-helpers';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  if (auth.profile.app_role !== 'crew' && auth.profile.app_role !== 'admin') {
    return NextResponse.json({ error: 'Crew only' }, { status: 403 });
  }

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

  if (!body.to_team_id || !body.amount || body.amount <= 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from('transactions').insert({
    from_user_id: auth.userId,
    to_team_id: body.to_team_id,
    amount: body.amount,
    type: 'reward',
    note: body.note ?? 'Crew reward',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
