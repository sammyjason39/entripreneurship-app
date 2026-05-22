import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse, verifyUserPin } from '@/lib/api-helpers';
import { teamBalanceFromJoin } from '@/lib/supabase-helpers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const { token } = await params;
  const body = (await request.json()) as { pin: string; amount?: number };

  const pinCheck = await verifyUserPin(auth.profile, body.pin);
  if (!pinCheck.ok) {
    return NextResponse.json({ error: pinCheck.error }, { status: pinCheck.status });
  }

  const supabase = await createClient();
  const { data: session } = await supabase
    .from('qr_sessions')
    .select('*')
    .eq('token', token)
    .single();

  if (!session || session.status !== 'pending') {
    return NextResponse.json({ error: 'Invalid or completed session' }, { status: 400 });
  }
  if (new Date(session.expires_at) < new Date()) {
    await supabase.from('qr_sessions').update({ status: 'expired' }).eq('id', session.id);
    return NextResponse.json({ error: 'QR expired' }, { status: 410 });
  }

  const { data: payerMember } = await supabase
    .from('team_members')
    .select('team_id, teams(balance)')
    .eq('user_id', auth.userId)
    .single();

  if (!payerMember) {
    return NextResponse.json({ error: 'You are not on a team' }, { status: 400 });
  }

  const { data: payeeMember } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', session.initiator_id)
    .maybeSingle();

  const amount = session.preset_amount ?? body.amount;
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Amount required' }, { status: 400 });
  }

  const payerBalance = teamBalanceFromJoin(payerMember.teams);
  const payerTeamId = payerMember.team_id;

  if (session.initiator_role === 'crew') {
    // Participant scans crew QR → receive reward
    const { error: txErr } = await supabase.from('transactions').insert({
      from_user_id: session.initiator_id,
      to_team_id: payerTeamId,
      amount,
      type: 'reward',
      note: session.note ?? 'Crew reward',
      qr_session_id: session.id,
    });
    if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 });
  } else if (session.initiator_role === 'participant' && payeeMember) {
    if (payerBalance < amount) {
      return NextResponse.json({ error: 'Not enough EnCoins' }, { status: 400 });
    }
    const { error: txErr } = await supabase.from('transactions').insert({
      from_user_id: auth.userId,
      from_team_id: payerTeamId,
      to_team_id: payeeMember.team_id,
      amount,
      type: 'transfer',
      note: session.note ?? 'P2P transfer',
      qr_session_id: session.id,
    });
    if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 });
  } else {
    return NextResponse.json({ error: 'Cannot resolve payee team' }, { status: 400 });
  }

  await supabase
    .from('qr_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: auth.userId,
    })
    .eq('id', session.id);

  return NextResponse.json({ success: true });
}
