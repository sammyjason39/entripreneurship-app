import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  if (auth.profile.app_role !== 'crew' && auth.profile.app_role !== 'admin') {
    return NextResponse.json({ error: 'Crew only' }, { status: 403 });
  }

  const body = (await request.json()) as {
    submission_id: string;
    action: 'approve' | 'reject';
    rejection_note?: string;
  };

  const supabase = await createClient();
  const { data: submission } = await supabase
    .from('submissions')
    .select('*, stations(point_reward)')
    .eq('id', body.submission_id)
    .single();

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (body.action === 'reject') {
    await supabase
      .from('submissions')
      .update({
        status: 'rejected',
        rejection_note: body.rejection_note ?? 'Please revise',
        reviewed_at: new Date().toISOString(),
        reviewed_by: auth.userId,
      })
      .eq('id', body.submission_id);
    return NextResponse.json({ success: true });
  }

  await supabase
    .from('submissions')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: auth.userId,
    })
    .eq('id', body.submission_id);

  const reward = (submission.stations as { point_reward: number })?.point_reward ?? 0;
  if (reward > 0) {
    await supabase.from('transactions').insert({
      from_user_id: auth.userId,
      to_team_id: submission.team_id,
      amount: reward,
      type: 'reward',
      note: `Station approval`,
    });
  }

  return NextResponse.json({ success: true });
}
