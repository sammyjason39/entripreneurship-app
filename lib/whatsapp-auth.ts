import { createServiceClient } from '@/lib/supabase/server';
import { normalizeWhatsAppPhone } from '@/lib/phone';
import { randomBytes } from 'crypto';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CHALLENGE_TTL_MINUTES = 10;

export function generateLoginCode(): string {
  let code = '';
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[bytes[i]! % CODE_CHARS.length];
  }
  return code;
}

const DEFAULT_BOT_NUMBER = '447441424421';

export function buildLoginMessage(code: string): string {
  return `Hi Connext! Let me login to entripreneurship.fun (${code})`;
}

export function parseCodeFromMessage(message: string): string | null {
  const text = message.trim();
  const connext = text.match(/entripreneurship\.fun\s*\(([A-Za-z0-9]{6})\)/i);
  if (connext) return connext[1]!.toUpperCase();
  const legacy = text.match(/log\s+me\s+in\s+([A-Za-z0-9]{6})/i);
  if (legacy) return legacy[1]!.toUpperCase();
  const paren = text.match(/\(([A-Za-z0-9]{6})\)/);
  return paren ? paren[1]!.toUpperCase() : null;
}

export function getWhatsAppBotNumber(): string {
  const raw =
    process.env.WHATSAPP_BOT_NUMBER?.trim() ||
    process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER?.trim() ||
    DEFAULT_BOT_NUMBER;
  const digits = raw.replace(/\D/g, '');
  return digits || DEFAULT_BOT_NUMBER;
}

export function buildWhatsAppDeepLink(code: string): string | null {
  const bot = getWhatsAppBotNumber();
  if (!bot) return null;
  const text = encodeURIComponent(buildLoginMessage(code));
  return `https://wa.me/${bot}?text=${text}`;
}

export function getAppOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, '');
  return 'http://localhost:3000';
}

/** One-tap link for the user after n8n confirms the OTP (also used by browser polling). */
export function buildFinishUrl(challengeId: string): string {
  return `${getAppOrigin()}/api/auth/whatsapp/finish?challengeId=${encodeURIComponent(challengeId)}`;
}

function syntheticEmail(normalizedPhone: string): string {
  return `wa+${normalizedPhone}@entripreneurship.fun`;
}

export async function findRegistrationByPhone(phoneInput: string) {
  const normalized = normalizeWhatsAppPhone(phoneInput);
  if (!normalized) return { normalized: null, registration: null };

  const service = await createServiceClient();
  const { data, error } = await service
    .from('event_registrations')
    .select('*')
    .eq('whatsapp_normalized', normalized)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return { normalized, registration: data };
}

export async function startWhatsAppChallenge(phoneInput: string) {
  const { normalized, registration } = await findRegistrationByPhone(phoneInput);
  if (!normalized) {
    return { ok: false as const, error: 'invalid_phone' };
  }
  if (!registration) {
    return { ok: false as const, error: 'not_registered' };
  }

  const service = await createServiceClient();
  const code = generateLoginCode();
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MINUTES * 60 * 1000).toISOString();

  // Invalidate older pending challenges for this phone
  await service
    .from('whatsapp_login_challenges')
    .update({ status: 'expired' })
    .eq('whatsapp_normalized', normalized)
    .eq('status', 'pending');

  const { data: challenge, error } = await service
    .from('whatsapp_login_challenges')
    .insert({
      registration_id: registration.id,
      whatsapp_normalized: normalized,
      code,
      status: 'pending',
      expires_at: expiresAt,
    })
    .select('id, code, expires_at')
    .single();

  if (error || !challenge) throw new Error(error?.message ?? 'Could not create login challenge');

  return {
    ok: true as const,
    challengeId: challenge.id,
    code: challenge.code,
    expiresAt: challenge.expires_at,
    fullName: registration.full_name,
    waUrl: buildWhatsAppDeepLink(challenge.code),
    message: buildLoginMessage(challenge.code),
  };
}

export async function confirmWhatsAppLogin(params: {
  phone: string;
  code: string;
}) {
  const normalized = normalizeWhatsAppPhone(params.phone);
  const code = params.code.trim().toUpperCase();
  if (!normalized || code.length !== 6) {
    return { ok: false as const, error: 'invalid_payload' };
  }

  const service = await createServiceClient();
  const now = new Date().toISOString();

  let challenge: { id: string; registration_id: string; whatsapp_normalized: string } | null =
    null;

  const { data: byPhone, error: findError } = await service
    .from('whatsapp_login_challenges')
    .select('id, registration_id, whatsapp_normalized')
    .eq('whatsapp_normalized', normalized)
    .eq('code', code)
    .eq('status', 'pending')
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  challenge = byPhone;

  // Fallback: n8n sometimes sends a mismatched phone format — match pending code only
  if (!challenge) {
    const { data: byCode, error: codeErr } = await service
      .from('whatsapp_login_challenges')
      .select('id, registration_id, whatsapp_normalized')
      .eq('code', code)
      .eq('status', 'pending')
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (codeErr) throw new Error(codeErr.message);
    challenge = byCode;
  }

  if (!challenge) {
    return { ok: false as const, error: 'invalid_or_expired' };
  }

  const { data: reg, error: regError } = await service
    .from('event_registrations')
    .select('id, full_name, user_id')
    .eq('id', challenge.registration_id)
    .single();

  if (regError || !reg) throw new Error(regError?.message ?? 'Registration not found');

  let userId = reg.user_id;

  if (!userId) {
    const { data: existingProfile } = await service
      .from('profiles')
      .select('id')
      .eq('whatsapp_normalized', normalized)
      .maybeSingle();

    if (existingProfile?.id) {
      userId = existingProfile.id;
    } else {
      const email = syntheticEmail(normalized);
      const password = randomBytes(24).toString('base64url');

      const { data: created, error: createError } = await service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: reg.full_name, whatsapp: normalized },
      });

      if (createError || !created.user) {
        throw new Error(createError?.message ?? 'Could not create auth user');
      }
      userId = created.user.id;
    }

    await service
      .from('profiles')
      .upsert(
        {
          id: userId,
          full_name: reg.full_name,
          app_role: 'participant',
          whatsapp_normalized: normalized,
        },
        { onConflict: 'id' }
      );

    await service
      .from('event_registrations')
      .update({ user_id: userId, linked_at: now, updated_at: now })
      .eq('id', reg.id);
  }

  const { error: confirmError } = await service
    .from('whatsapp_login_challenges')
    .update({ status: 'confirmed', confirmed_at: now })
    .eq('id', challenge.id);

  if (confirmError) throw new Error(confirmError.message);

  return {
    ok: true as const,
    challengeId: challenge.id,
    userId,
    finishUrl: buildFinishUrl(challenge.id),
  };
}

export async function getChallengeStatus(challengeId: string) {
  const service = await createServiceClient();
  const { data, error } = await service
    .from('whatsapp_login_challenges')
    .select('id, status, expires_at, confirmed_at')
    .eq('id', challengeId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return { ok: false as const, error: 'not_found' };

  const now = Date.now();
  if (data.status === 'pending' && new Date(data.expires_at).getTime() < now) {
    await service
      .from('whatsapp_login_challenges')
      .update({ status: 'expired' })
      .eq('id', challengeId);
    return { ok: true as const, status: 'expired' as const };
  }

  return {
    ok: true as const,
    status: data.status as 'pending' | 'confirmed' | 'expired' | 'consumed',
    confirmedAt: data.confirmed_at,
  };
}

export async function consumeChallengeForSession(challengeId: string) {
  const service = await createServiceClient();
  const { data: challenge, error } = await service
    .from('whatsapp_login_challenges')
    .select('id, status, whatsapp_normalized, registration_id')
    .eq('id', challengeId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!challenge || challenge.status !== 'confirmed') {
    return { ok: false as const, error: 'not_ready' };
  }

  const { data: reg } = await service
    .from('event_registrations')
    .select('user_id, full_name')
    .eq('id', challenge.registration_id)
    .single();

  if (!reg?.user_id) return { ok: false as const, error: 'no_user' };

  const email = syntheticEmail(challenge.whatsapp_normalized);
  const appUrl = getAppOrigin();

  const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (linkError || !linkData.properties?.action_link) {
    throw new Error(linkError?.message ?? 'Could not generate login link');
  }

  await service
    .from('whatsapp_login_challenges')
    .update({ status: 'consumed', consumed_at: new Date().toISOString() })
    .eq('id', challengeId);

  return { ok: true as const, actionLink: linkData.properties.action_link };
}
