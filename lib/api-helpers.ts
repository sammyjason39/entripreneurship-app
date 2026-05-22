import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { verifyPin, isValidPin } from '@/lib/pin';
import type { Profile } from '@/lib/types';

export async function getAuthenticatedSupabase() {
  const resolved = await resolveUser();
  if (!resolved) return null;
  return resolved.supabase;
}

async function resolveUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return { user, supabase };

  const authHeader = (await headers()).get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const bearerClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  const {
    data: { user: bearerUser },
  } = await bearerClient.auth.getUser();
  if (!bearerUser) return null;
  return { user: bearerUser, supabase: bearerClient };
}

export async function getAuthProfile(): Promise<
  { profile: Profile; userId: string } | NextResponse
> {
  const resolved = await resolveUser();
  if (!resolved) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { user, supabase } = resolved;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }
  return { profile: profile as Profile, userId: user.id };
}

export function isNextResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}

export async function verifyUserPin(
  profile: Profile,
  pin: string
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  if (!isValidPin(pin)) {
    return { ok: false, error: 'PIN must be 6 digits', status: 400 };
  }
  if (profile.pin_locked_until && new Date(profile.pin_locked_until) > new Date()) {
    return { ok: false, error: 'PIN locked. Try again in 5 minutes.', status: 429 };
  }
  const valid = await verifyPin(pin, profile.pin_hash);
  const resolved = await resolveUser();
  const supabase = resolved?.supabase ?? (await createServerClient());
  if (!valid) {
    const attempts = (profile.pin_failed_attempts ?? 0) + 1;
    const updates: Partial<Profile> = { pin_failed_attempts: attempts };
    if (attempts >= 5) {
      updates.pin_locked_until = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      updates.pin_failed_attempts = 0;
    }
    await supabase.from('profiles').update(updates).eq('id', profile.id);
    return { ok: false, error: 'Incorrect PIN', status: 401 };
  }
  await supabase
    .from('profiles')
    .update({ pin_failed_attempts: 0, pin_locked_until: null })
    .eq('id', profile.id);
  return { ok: true };
}
