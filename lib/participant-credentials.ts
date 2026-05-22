import { normalizeWhatsAppPhone } from '@/lib/phone';

export function normalizeStudentId(raw: string): string {
  return raw.trim().toUpperCase();
}

/** Stable auth email from student ID (not shown to users). */
export function studentIdToEmail(studentId: string): string {
  const clean = normalizeStudentId(studentId).replace(/[^A-Z0-9]/g, '');
  if (!clean) throw new Error('Invalid student ID');
  return `p.${clean}@entripreneurship.fun`;
}

export function phoneToPassword(phoneInput: string): string {
  const normalized = normalizeWhatsAppPhone(phoneInput);
  if (!normalized) {
    throw new Error('Enter a valid Indonesian WhatsApp number (08… or 62…).');
  }
  return normalized;
}
