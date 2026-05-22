import { createServiceClient } from '@/lib/supabase/server';
import { normalizeWhatsAppPhone } from '@/lib/phone';
import { normalizeStudentId, studentIdToEmail, phoneToPassword } from '@/lib/participant-credentials';

export { normalizeStudentId, studentIdToEmail, phoneToPassword } from '@/lib/participant-credentials';

export async function registerParticipant(input: {
  full_name: string;
  student_id: string;
  phone: string;
}) {
  const fullName = input.full_name.trim();
  const studentId = normalizeStudentId(input.student_id);
  const password = phoneToPassword(input.phone);
  const whatsapp = normalizeWhatsAppPhone(input.phone)!;

  if (!fullName) throw new Error('Full name is required.');
  if (!studentId) throw new Error('Student ID is required.');

  const service = await createServiceClient();
  const email = studentIdToEmail(studentId);

  const { data: existing } = await service
    .from('profiles')
    .select('id')
    .eq('student_id', studentId)
    .maybeSingle();

  if (existing) throw new Error('This student ID is already registered. Go to Login.');

  const { data: phoneUsed } = await service
    .from('profiles')
    .select('student_id')
    .eq('whatsapp_normalized', whatsapp)
    .maybeSingle();

  if (phoneUsed?.student_id && phoneUsed.student_id !== studentId) {
    throw new Error('This WhatsApp number is already registered to another student.');
  }

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, student_id: studentId, whatsapp },
  });

  if (createError) {
    if (createError.message.includes('already been registered')) {
      throw new Error('This student ID is already registered. Go to Login.');
    }
    throw new Error(createError.message);
  }
  if (!created.user) throw new Error('Could not create account');

  const userId = created.user.id;

  await service.from('profiles').upsert(
    {
      id: userId,
      full_name: fullName,
      student_id: studentId,
      whatsapp_normalized: whatsapp,
      app_role: 'participant',
      onboarding_complete: false,
    },
    { onConflict: 'id' }
  );

  await service.from('event_registrations').upsert(
    {
      whatsapp_normalized: whatsapp,
      full_name: fullName,
      student_id: studentId,
      user_id: userId,
      linked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'whatsapp_normalized' }
  );

  return { email, studentId, userId };
}
