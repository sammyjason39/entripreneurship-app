import { sanitizeWhatsAppSender } from '@/lib/phone';

export type WahaIncomingMessage = {
  event: string;
  session: string;
  chatId: string;
  from: string;
  body: string;
  fromMe: boolean;
};

function baseUrl(): string {
  const raw = process.env.WAHA_BASE_URL?.trim();
  if (!raw) return '';
  return raw.replace(/\/$/, '');
}

export function isWahaConfigured(): boolean {
  return Boolean(baseUrl() && process.env.WAHA_API_KEY?.trim());
}

export function getWahaSession(): string {
  return process.env.WAHA_SESSION?.trim() || 'default';
}

/** WAHA POST /api/sendText */
export async function sendWahaText(params: {
  chatId: string;
  text: string;
  session?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const url = baseUrl();
  const apiKey = process.env.WAHA_API_KEY?.trim();
  if (!url || !apiKey) {
    return { ok: false, error: 'WAHA_BASE_URL or WAHA_API_KEY not configured' };
  }

  const chatId = toWahaChatId(params.chatId);
  const session = params.session ?? getWahaSession();

  try {
    const res = await fetch(`${url}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        chatId,
        text: params.text,
        session,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('waha/sendText', res.status, errText.slice(0, 500));
      return { ok: false, error: `WAHA send failed (${res.status})` };
    }
    return { ok: true };
  } catch (e) {
    console.error('waha/sendText', e);
    return { ok: false, error: e instanceof Error ? e.message : 'WAHA send failed' };
  }
}

/** `628978073890` or `628978073890@c.us` → chat id for sendText */
export function toWahaChatId(fromOrPhone: string): string {
  const cleaned = sanitizeWhatsAppSender(fromOrPhone);
  if (cleaned.includes('@')) return cleaned;
  const digits = cleaned.replace(/\D/g, '');
  return `${digits}@c.us`;
}

/**
 * Parse WAHA webhook body (event: message).
 * @see https://waha.devlike.pro/docs/how-to/receive-messages/
 */
export function parseWahaWebhook(body: unknown): WahaIncomingMessage | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;

  const event = typeof b.event === 'string' ? b.event : '';
  if (event !== 'message') return null;

  const session = typeof b.session === 'string' ? b.session : getWahaSession();
  const payload = b.payload;
  if (!payload || typeof payload !== 'object') return null;

  const p = payload as Record<string, unknown>;
  if (p.fromMe === true) return null;

  const from = typeof p.from === 'string' ? p.from : '';
  const bodyText =
    (typeof p.body === 'string' && p.body) ||
    (typeof p.caption === 'string' && p.caption) ||
    '';

  if (!from) return null;

  return {
    event,
    session,
    chatId: from,
    from,
    body: bodyText.trim(),
    fromMe: false,
  };
}

export function isLoginRelatedMessage(text: string): boolean {
  const t = text.toLowerCase();
  return t.includes('entripreneurship.fun') || /\([A-Za-z0-9]{6}\)/.test(text);
}

export function buildLoginSuccessReply(finishUrl: string, fullName?: string): string {
  const greet = fullName ? `Hi ${fullName}! ` : '';
  return (
    `${greet}✅ You're verified for EnTripreneurship Vol. 02.\n\n` +
    `Tap to open the app:\n${finishUrl}\n\n` +
    `You can also return to Chrome — the login page should continue automatically.`
  );
}

export function buildLoginFailureReply(): string {
  return (
    `❌ That login code didn't work or has expired.\n\n` +
    `1. Open https://entripreneurship.fun/auth/login\n` +
    `2. Enter your WhatsApp number\n` +
    `3. Send the *exact* message shown (with the 6-character code)\n\n` +
    `Codes expire after 10 minutes.`
  );
}

export function buildLoginHintReply(): string {
  return (
    `To log in to entripreneurship.fun, open the login page, enter your registered WhatsApp number, ` +
    `then send the message shown there to this chat (including the code in brackets).`
  );
}
