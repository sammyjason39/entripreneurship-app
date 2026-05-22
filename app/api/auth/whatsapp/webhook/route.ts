import { NextResponse } from 'next/server';
import { requireWebhookApiKey } from '@/lib/webhook-auth';
import {
  confirmWhatsAppLogin,
  parseCodeFromMessage,
} from '@/lib/whatsapp-auth';
import { normalizeWhatsAppPhone } from '@/lib/phone';

/**
 * Called by n8n when your WhatsApp bot receives: "Log me in ABC123"
 * See docs/WHATSAPP_LOGIN.md
 */
export async function POST(request: Request) {
  const authError = requireWebhookApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    let phone =
      (typeof body.phone === 'string' && body.phone) ||
      (typeof body.whatsapp === 'string' && body.whatsapp) ||
      (typeof body.from === 'string' && body.from) ||
      '';

    let code =
      (typeof body.code === 'string' && body.code) ||
      (typeof body.otp === 'string' && body.otp) ||
      '';

    if (!code && typeof body.message === 'string') {
      code = parseCodeFromMessage(body.message) ?? '';
    }

    if (!phone && typeof body.message === 'string') {
      // n8n may only forward message + sender in separate fields
      phone = typeof body.sender === 'string' ? body.sender : phone;
    }

    const normalized = normalizeWhatsAppPhone(phone);
    if (!normalized || !code) {
      return NextResponse.json(
        {
          ok: false,
          error: 'invalid_payload',
          hint: 'Send phone (or whatsapp/from) and code (or otp), or message containing "Log me in XXXXXX"',
        },
        { status: 400 }
      );
    }

    const result = await confirmWhatsAppLogin({ phone: normalized, code });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      challengeId: result.challengeId,
      userId: result.userId,
    });
  } catch (e) {
    console.error('whatsapp/webhook', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
