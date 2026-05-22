import { NextResponse } from 'next/server';
import { requireWebhookApiKey } from '@/lib/webhook-auth';
import { processInboundWhatsAppLogin } from '@/lib/whatsapp-inbound';
import { sanitizeWhatsAppSender } from '@/lib/phone';
import { buildLoginSuccessReply, isWahaConfigured, sendWahaText, toWahaChatId } from '@/lib/waha';

/**
 * Generic JSON webhook (n8n or manual). Prefer /api/auth/whatsapp/waha for WAHA.
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
      (typeof body.sender === 'string' && body.sender) ||
      (typeof body.remoteJid === 'string' && body.remoteJid) ||
      '';

    const messageText =
      (typeof body.message === 'string' && body.message) ||
      (typeof body.text === 'string' && body.text) ||
      (typeof body.body === 'string' && body.body) ||
      '';

    const code =
      (typeof body.code === 'string' && body.code) ||
      (typeof body.otp === 'string' && body.otp) ||
      '';

    phone = sanitizeWhatsAppSender(phone);

    const result = await processInboundWhatsAppLogin({
      phone,
      message: messageText,
      code,
    });

    if (result.kind === 'invalid_payload') {
      return NextResponse.json(
        {
          ok: false,
          error: 'invalid_payload',
          hint: 'Send phone and code, or message like: Hi Connext! Let me login to entripreneurship.fun (XXXXXX)',
        },
        { status: 400 }
      );
    }

    if (result.kind === 'failed') {
      return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
    }

    if (result.kind === 'confirmed') {
      if (isWahaConfigured() && phone) {
        await sendWahaText({
          chatId: toWahaChatId(phone),
          text: buildLoginSuccessReply(result.finishUrl),
        });
      }

      return NextResponse.json({
        ok: true,
        challengeId: result.challengeId,
        userId: result.userId,
        finishUrl: result.finishUrl,
      });
    }

    return NextResponse.json({ ok: true, ignored: true, reason: result.kind });
  } catch (e) {
    console.error('whatsapp/webhook', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
