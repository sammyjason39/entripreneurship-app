import { NextResponse } from 'next/server';

/** Simple shared-secret check for n8n → app webhooks. */
export function requireWebhookApiKey(request: Request): NextResponse | null {
  const expected = process.env.WHATSAPP_WEBHOOK_API_KEY?.trim();
  if (!expected) {
    return NextResponse.json(
      { error: 'Webhook API key not configured on server' },
      { status: 503 }
    );
  }

  const headerKey =
    request.headers.get('x-api-key')?.trim() ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  if (!headerKey || headerKey !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
