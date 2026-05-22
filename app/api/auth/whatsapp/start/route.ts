import { NextResponse } from 'next/server';
import { startWhatsAppChallenge } from '@/lib/whatsapp-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = typeof body.phone === 'string' ? body.phone : '';
    if (!phone.trim()) {
      return NextResponse.json({ error: 'phone is required' }, { status: 400 });
    }

    const result = await startWhatsAppChallenge(phone);
    if (!result.ok) {
      const status = result.error === 'invalid_phone' ? 400 : 404;
      const message =
        result.error === 'not_registered'
          ? 'This WhatsApp number is not on the registration list. Use the number you submitted on the form.'
          : 'Enter a valid Indonesian WhatsApp number.';
      return NextResponse.json({ error: result.error, message }, { status });
    }

    return NextResponse.json({
      challengeId: result.challengeId,
      code: result.code,
      message: result.message,
      waUrl: result.waUrl,
      expiresAt: result.expiresAt,
      fullName: result.fullName,
    });
  } catch (e) {
    console.error('whatsapp/start', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
