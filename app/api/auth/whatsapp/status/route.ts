import { NextResponse } from 'next/server';
import { getChallengeStatus } from '@/lib/whatsapp-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const challengeId = new URL(request.url).searchParams.get('challengeId')?.trim();
    if (!challengeId) {
      return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
    }

    const result = await getChallengeStatus(challengeId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    const origin = new URL(request.url).origin;
    const finishPath = `/api/auth/whatsapp/finish?challengeId=${encodeURIComponent(challengeId)}`;

    return NextResponse.json({
      status: result.status,
      confirmedAt: result.confirmedAt ?? null,
      finishUrl: result.status === 'confirmed' ? `${origin}${finishPath}` : null,
    });
  } catch (e) {
    console.error('whatsapp/status', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
