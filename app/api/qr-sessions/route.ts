import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse, verifyUserPin } from '@/lib/api-helpers';
import { generateSessionToken } from '@/lib/utils';
import { QR_SESSION_MINUTES } from '@/lib/types';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const body = (await request.json()) as {
    pin?: string;
    preset_amount?: number | null;
    note?: string;
  };

  if (!body.pin) return NextResponse.json({ error: 'PIN required' }, { status: 400 });
  const pinCheck = await verifyUserPin(auth.profile, body.pin);
  if (!pinCheck.ok) {
    return NextResponse.json({ error: pinCheck.error }, { status: pinCheck.status });
  }

  const role =
    auth.profile.app_role === 'crew' || auth.profile.app_role === 'admin'
      ? 'crew'
      : 'participant';

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + QR_SESSION_MINUTES * 60 * 1000).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('qr_sessions')
    .insert({
      token,
      initiator_id: auth.userId,
      initiator_role: role,
      preset_amount: body.preset_amount ?? null,
      note: body.note ?? null,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
