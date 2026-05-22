import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';

export async function POST() {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const supabase = await createClient();
  const { data: member } = await supabase
    .from('team_members')
    .select('id')
    .eq('user_id', auth.userId)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: 'Join or create a team first' }, { status: 400 });
  }

  if (!auth.profile.pin_hash) {
    return NextResponse.json({ error: 'Set PIN first' }, { status: 400 });
  }

  await supabase
    .from('profiles')
    .update({ onboarding_complete: true })
    .eq('id', auth.userId);

  return NextResponse.json({ success: true });
}
