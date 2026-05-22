import { normalizeWhatsAppPhone, sanitizeWhatsAppSender } from '@/lib/phone';
import { confirmWhatsAppLogin, parseCodeFromMessage } from '@/lib/whatsapp-auth';

export type InboundLoginResult =
  | { kind: 'ignored'; reason: string }
  | { kind: 'invalid_payload' }
  | { kind: 'not_login' }
  | { kind: 'failed'; error: string }
  | {
      kind: 'confirmed';
      challengeId: string;
      userId: string;
      finishUrl: string;
      normalizedPhone: string;
    };

export function extractInboundLogin(body: {
  phone?: string;
  message?: string;
  code?: string;
}): { normalized: string | null; code: string; message: string } {
  let phone = body.phone?.trim() ?? '';
  const message = body.message?.trim() ?? '';
  let code = body.code?.trim() ?? '';

  if (!code && message) {
    code = parseCodeFromMessage(message) ?? '';
  }

  phone = sanitizeWhatsAppSender(phone);
  const normalized = normalizeWhatsAppPhone(phone);
  const codeNorm = code.replace(/\s/g, '').toUpperCase();

  return { normalized, code: codeNorm, message };
}

export async function processInboundWhatsAppLogin(body: {
  phone?: string;
  message?: string;
  code?: string;
}): Promise<InboundLoginResult> {
  const { normalized, code, message } = extractInboundLogin(body);

  if (!message && !code) {
    return { kind: 'ignored', reason: 'empty' };
  }

  if (!code && message && !message.toLowerCase().includes('entripreneurship.fun')) {
    return { kind: 'not_login' };
  }

  if (!normalized || code.length !== 6) {
    return { kind: 'invalid_payload' };
  }

  const result = await confirmWhatsAppLogin({ phone: normalized, code });
  if (!result.ok) {
    return { kind: 'failed', error: result.error };
  }

  return {
    kind: 'confirmed',
    challengeId: result.challengeId,
    userId: result.userId,
    finishUrl: result.finishUrl,
    normalizedPhone: normalized,
  };
}
