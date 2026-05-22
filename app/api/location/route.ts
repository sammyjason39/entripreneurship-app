import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const { lat, lng } = (await request.json()) as { lat?: number; lng?: number };
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', auth.userId)
    .maybeSingle();

  await supabase.from('location_pings').insert({
    user_id: auth.userId,
    team_id: member?.team_id ?? null,
    lat,
    lng,
  });

  // Keep only latest ping per user (cleanup old)
  const { data: oldPings } = await supabase
    .from('location_pings')
    .select('id')
    .eq('user_id', auth.userId)
    .order('pinged_at', { ascending: false })
    .range(5, 100);

  if (oldPings?.length) {
    await supabase
      .from('location_pings')
      .delete()
      .in(
        'id',
        oldPings.map((p) => p.id)
      );
  }

  return NextResponse.json({ ok: true });
}
