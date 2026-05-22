import { NextResponse } from 'next/server';
import { consumeChallengeForSession } from '@/lib/whatsapp-auth';

export const dynamic = 'force-dynamic';

/** Browser redirect after WhatsApp confirmed — exchanges challenge for Supabase magic link. */
export async function GET(request: Request) {
  try {
    const challengeId = new URL(request.url).searchParams.get('challengeId')?.trim();
    if (!challengeId) {
      return NextResponse.json({ error: 'challengeId is required' }, { status: 400 });
    }

    const result = await consumeChallengeForSession(challengeId);
    if (!result.ok) {
      const origin = new URL(request.url).origin;
      return NextResponse.redirect(
        `${origin}/auth/login?error=whatsapp_not_ready`
      );
    }

    return NextResponse.redirect(result.actionLink);
  } catch (e) {
    console.error('whatsapp/finish', e);
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/auth/login?error=whatsapp_finish_failed`);
  }
}
