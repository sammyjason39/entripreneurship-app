import { NextResponse } from 'next/server';
import { getAuthProfile, isNextResponse, verifyUserPin } from '@/lib/api-helpers';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const { pin } = (await request.json()) as { pin?: string };
  if (!pin) return NextResponse.json({ error: 'PIN required' }, { status: 400 });

  const result = await verifyUserPin(auth.profile, pin);
  if (!result.ok) {
    return NextResponse.json({ valid: false, error: result.error }, { status: result.status });
  }
  return NextResponse.json({ valid: true });
}
