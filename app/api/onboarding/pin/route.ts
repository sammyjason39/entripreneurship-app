import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';
import { hashPin, isValidPin } from '@/lib/pin';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const { pin } = (await request.json()) as { pin?: string };
  if (!pin || !isValidPin(pin)) {
    return NextResponse.json({ error: 'PIN must be 6 digits' }, { status: 400 });
  }

  const pin_hash = await hashPin(pin);
  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ pin_hash }).eq('id', auth.userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
