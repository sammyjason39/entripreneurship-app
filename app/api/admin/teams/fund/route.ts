import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const body = (await request.json()) as {
    team_id?: string;
    amount?: number;
    action?: 'add' | 'deduct';
    note?: string;
  };

  const teamId = body.team_id?.trim();
  const amount = Number(body.amount);
  const action = body.action;

  if (!teamId || !amount || amount <= 0 || (action !== 'add' && action !== 'deduct')) {
    return NextResponse.json({ error: 'Invalid team, amount, or action' }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data: team, error: teamErr } = await service
    .from('teams')
    .select('id, name, balance')
    .eq('id', teamId)
    .single();

  if (teamErr || !team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }

  if (action === 'deduct' && team.balance < amount) {
    return NextResponse.json(
      { error: `Insufficient balance (${team.balance} EnCoins)` },
      { status: 400 }
    );
  }

  const note = body.note?.trim() || (action === 'add' ? 'Admin add' : 'Admin deduct');

  const { error: txErr } =
    action === 'add'
      ? await service.from('transactions').insert({
          from_user_id: auth.user.id,
          to_team_id: teamId,
          amount,
          type: 'reward',
          note,
        })
      : await service.from('transactions').insert({
          from_user_id: auth.user.id,
          from_team_id: teamId,
          to_team_id: teamId,
          amount,
          type: 'spend',
          note,
        });
  if (txErr) {
    return NextResponse.json({ error: txErr.message }, { status: 500 });
  }

  const { data: updated } = await service
    .from('teams')
    .select('id, name, balance')
    .eq('id', teamId)
    .single();

  return NextResponse.json({
    ok: true,
    team: updated,
    delta: action === 'add' ? amount : -amount,
  });
}
