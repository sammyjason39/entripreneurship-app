import { createServiceClient } from '@/lib/supabase/server';
import { normalizeWhatsAppPhone, formatPhoneDisplay } from '@/lib/phone';
import type { EventRegistration, EventRegistrationInput } from '@/lib/types';

export { formatPhoneDisplay };

function toRecord(input: EventRegistrationInput, normalized: string) {
  return {
    whatsapp_normalized: normalized,
    full_name: input.full_name.trim(),
    student_id: input.student_id?.trim() || null,
    study_program: input.study_program?.trim() || null,
    email: input.email?.trim() || null,
    form_email: input.form_email?.trim() || null,
    commit_attendance: input.commit_attendance?.trim() || null,
    interests: input.interests?.trim() || null,
    info_source: input.info_source?.trim() || null,
    referral_name: input.referral_name?.trim() || null,
    updated_at: new Date().toISOString(),
  };
}

export function parseRegistrationInput(input: EventRegistrationInput) {
  const normalized = normalizeWhatsAppPhone(input.whatsapp);
  if (!normalized) {
    throw new Error('Invalid WhatsApp number. Use format 08xxxxxxxxxx or 628xxxxxxxxxx.');
  }
  if (!input.full_name?.trim()) {
    throw new Error('Full name is required.');
  }
  return { normalized, record: toRecord(input, normalized) };
}

export async function listEventRegistrations(search?: string): Promise<EventRegistration[]> {
  const service = await createServiceClient();
  let q = service
    .from('event_registrations')
    .select('*')
    .order('full_name', { ascending: true });

  const term = search?.trim();
  if (term) {
    const safe = term.replace(/[%_,]/g, '');
    q = q.or(
      `full_name.ilike.%${safe}%,whatsapp_normalized.ilike.%${safe}%,student_id.ilike.%${safe}%,email.ilike.%${safe}%`
    );
  }

  const { data, error } = await q.limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as EventRegistration[];
}

export async function getRegistrationStats() {
  const service = await createServiceClient();
  const { count: total, error: tErr } = await service
    .from('event_registrations')
    .select('*', { count: 'exact', head: true });
  const { count: linked, error: lErr } = await service
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .not('user_id', 'is', null);
  if (tErr) throw new Error(tErr.message);
  if (lErr) throw new Error(lErr.message);
  return { total: total ?? 0, linked: linked ?? 0 };
}

export async function createEventRegistration(input: EventRegistrationInput) {
  const { normalized, record } = parseRegistrationInput(input);
  const service = await createServiceClient();
  const { data, error } = await service
    .from('event_registrations')
    .insert(record)
    .select('*')
    .single();
  if (error) {
    if (error.code === '23505') {
      throw new Error(`WhatsApp ${formatPhoneDisplay(normalized)} is already registered.`);
    }
    throw new Error(error.message);
  }
  return data as EventRegistration;
}

export async function updateEventRegistration(id: string, input: EventRegistrationInput) {
  const { normalized, record } = parseRegistrationInput(input);
  const service = await createServiceClient();
  const { data, error } = await service
    .from('event_registrations')
    .update(record)
    .eq('id', id)
    .select('*')
    .single();
  if (error) {
    if (error.code === '23505') {
      throw new Error(`WhatsApp ${formatPhoneDisplay(normalized)} is already used by another person.`);
    }
    throw new Error(error.message);
  }
  return data as EventRegistration;
}

export async function deleteEventRegistration(id: string) {
  const service = await createServiceClient();
  const { error } = await service.from('event_registrations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
