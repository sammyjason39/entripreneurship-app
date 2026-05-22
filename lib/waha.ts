import { normalizeWhatsAppPhone, sanitizeWhatsAppSender } from '@/lib/phone';

export type WahaIncomingMessage = {
  event: string;
  session: string;
  chatId: string;
  from: string;
  /** Resolved Indonesian E.164 without + (e.g. 628978073890), when available */
  phoneNormalized: string | null;
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

function pickJid(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return '';
}

/** NOWEB / GOWS sometimes put the real @c.us JID in _data while `from` is @lid */
function senderPnFromPayloadData(p: Record<string, unknown>): string {
  const data = p._data;
  if (!data || typeof data !== 'object') return '';
  const d = data as Record<string, unknown>;
  const key = d.key;
  if (key && typeof key === 'object') {
    const k = key as Record<string, unknown>;
    const senderPn = pickJid(k.senderPn, k.participant);
    if (senderPn) return senderPn;
  }
  const info = d.Info;
  if (info && typeof info === 'object') {
    const i = info as Record<string, unknown>;
    return pickJid(i.SenderAlt, i.senderAlt);
  }
  return '';
}

/** GET /api/{session}/lids/{lid} — map @lid → @c.us */
export async function resolveLidToChatId(
  lid: string,
  session?: string
): Promise<string | null> {
  const url = baseUrl();
  const apiKey = process.env.WAHA_API_KEY?.trim();
  if (!url || !apiKey || !lid.includes('@lid')) return null;

  const sess = session ?? getWahaSession();
  const lidParam = encodeURIComponent(lid.includes('@') ? lid : `${lid}@lid`);

  try {
    const res = await fetch(`${url}/api/${encodeURIComponent(sess)}/lids/${lidParam}`, {
      headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { pn?: string | null };
    return typeof data.pn === 'string' && data.pn ? data.pn : null;
  } catch (e) {
    console.error('waha/resolveLid', e);
    return null;
  }
}

export async function resolveWahaSenderPhone(
  from: string,
  payload: Record<string, unknown>,
  session: string
): Promise<string | null> {
  const candidates = [
    from,
    typeof payload.participant === 'string' ? payload.participant : '',
    senderPnFromPayloadData(payload),
  ];

  for (const jid of candidates) {
    const n = normalizeWhatsAppPhone(sanitizeWhatsAppSender(jid));
    if (n) return n;
  }

  if (from.includes('@lid')) {
    const pn = await resolveLidToChatId(from, session);
    if (pn) {
      const n = normalizeWhatsAppPhone(sanitizeWhatsAppSender(pn));
      if (n) return n;
    }
  }

  return null;
}

/**
 * Parse WAHA webhook body (event: message).
 * @see https://waha.devlike.pro/docs/how-to/receive-messages/
 */
export async function parseWahaWebhook(body: unknown): Promise<WahaIncomingMessage | null> {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;

  const event = typeof b.event === 'string' ? b.event : '';
  if (event !== 'message' && event !== 'message.any') return null;

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

  const phoneNormalized = await resolveWahaSenderPhone(from, p, session);

  return {
    event,
    session,
    chatId: from,
    from,
    phoneNormalized,
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

export function buildLoginFailureReply(error?: string): string {
  if (error === 'already_confirmed') {
    return (
      `✅ This code was already accepted.\n\n` +
      `Open the login page in your browser and tap *I sent the message — check now*, ` +
      `or request a new code if you need a fresh link.`
    );
  }
  if (error === 'expired') {
    return (
      `❌ This code has expired.\n\n` +
      `Open https://entripreneurship.fun/auth/login, enter your number again, ` +
      `and send the *new* message shown on screen (do not reuse an old code).`
    );
  }
  if (error === 'already_used') {
    return (
      `✅ This code was already accepted.\n\n` +
      `Go back to the browser login page and tap *I sent the message — check now*, ` +
      `or start again to get a fresh code and link.`
    );
  }
  return (
    `❌ That login code didn't work.\n\n` +
    `1. Open https://entripreneurship.fun/auth/login\n` +
    `2. Enter the *same* WhatsApp number as on the registration form\n` +
    `3. Copy the *new* message from the screen (do not retype from an old chat)\n` +
    `4. Send it here immediately — codes expire in 30 minutes\n\n` +
    `Your number on file may be 0877-2858-9845 (not the longer typo variant).`
  );
}

export function buildLoginHintReply(): string {
  return (
    `To log in to entripreneurship.fun, open the login page, enter your registered WhatsApp number, ` +
    `then send the message shown there to this chat (including the code in brackets).`
  );
}
