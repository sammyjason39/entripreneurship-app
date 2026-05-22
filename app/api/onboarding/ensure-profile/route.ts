import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';

/** Ensures profile row exists (fallback if auth trigger did not run). */
export async function POST() {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', auth.userId)
    .maybeSingle();

  if (existing) return NextResponse.json({ ok: true, created: false });

  const { error } = await supabase.from('profiles').insert({
    id: auth.userId,
    full_name: auth.profile.full_name || 'Participant',
    app_role: 'participant',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, created: true });
}
