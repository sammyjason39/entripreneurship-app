import { NextResponse } from 'next/server';
import { processInboundWhatsAppLogin } from '@/lib/whatsapp-inbound';
import { sanitizeWhatsAppSender } from '@/lib/phone';
import {
  buildLoginFailureReply,
  buildLoginHintReply,
  buildLoginSuccessReply,
  isLoginRelatedMessage,
  isWahaConfigured,
  parseWahaWebhook,
  sendWahaText,
} from '@/lib/waha';

export const dynamic = 'force-dynamic';

/**
 * WAHA webhook — point session webhooks here (event: message).
 * POST https://entripreneurship.fun/api/auth/whatsapp/waha
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const incoming = parseWahaWebhook(body);

    if (!incoming) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'not_inbound_message' });
    }

    const phoneFromChat = sanitizeWhatsAppSender(incoming.from);

    if (!isLoginRelatedMessage(incoming.body)) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'not_login_message' });
    }

    const result = await processInboundWhatsAppLogin({
      phone: phoneFromChat,
      message: incoming.body,
    });

    if (result.kind === 'not_login') {
      if (isWahaConfigured()) {
        await sendWahaText({
          chatId: incoming.chatId,
          text: buildLoginHintReply(),
          session: incoming.session,
        });
      }
      return NextResponse.json({ ok: true, hint: true });
    }

    if (result.kind === 'invalid_payload' || result.kind === 'failed') {
      if (isWahaConfigured()) {
        await sendWahaText({
          chatId: incoming.chatId,
          text: buildLoginFailureReply(),
          session: incoming.session,
        });
      }
      return NextResponse.json({
        ok: false,
        error: result.kind === 'failed' ? result.error : 'invalid_or_expired',
      });
    }

    if (result.kind === 'confirmed') {
      let wahaSent = false;
      if (isWahaConfigured()) {
        const sent = await sendWahaText({
          chatId: incoming.chatId,
          text: buildLoginSuccessReply(result.finishUrl),
          session: incoming.session,
        });
        wahaSent = sent.ok;
        if (!sent.ok) console.error('waha/reply', sent.error);
      }

      return NextResponse.json({
        ok: true,
        challengeId: result.challengeId,
        userId: result.userId,
        finishUrl: result.finishUrl,
        wahaReplySent: wahaSent,
      });
    }

    return NextResponse.json({ ok: true, ignored: true, reason: result.reason });
  } catch (e) {
    console.error('whatsapp/waha', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

/** WAHA or uptime monitors may probe with GET */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'entripreneurship-waha-webhook',
    wahaConfigured: isWahaConfigured(),
    usage: 'POST WAHA message events to this URL',
  });
}
