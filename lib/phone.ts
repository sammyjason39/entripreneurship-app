/** Strip WhatsApp JID suffixes (`628...@s.whatsapp.net`) before normalization. */
export function sanitizeWhatsAppSender(input: string): string {
  return input.trim().replace(/@s\.whatsapp\.net$/i, '').replace(/@c\.us$/i, '');
}

/** Normalize Indonesian WhatsApp numbers to E.164 without + (e.g. 628978073890). */
export function normalizeWhatsAppPhone(input: string): string | null {
  let digits = sanitizeWhatsAppSender(input).replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('62')) {
    // already country code
  } else if (digits.startsWith('0')) {
    digits = `62${digits.slice(1)}`;
  } else if (digits.startsWith('8')) {
    digits = `62${digits}`;
  } else if (digits.startsWith('9') && digits.length >= 9 && digits.length <= 11) {
    // Some gateways send local mobile without leading 0/8 (e.g. 978073890)
    digits = `62${digits}`;
  } else {
    return null;
  }

  // Indonesia mobile: 62 + 8–12 digits (typically 10–13 total length)
  if (digits.length < 10 || digits.length > 15) return null;
  if (!digits.startsWith('62')) return null;

  return digits;
}

/** Display format for UI (e.g. 0897 807 3890). */
export function formatPhoneDisplay(normalized: string): string {
  if (normalized.startsWith('62')) {
    const local = `0${normalized.slice(2)}`;
    if (local.length <= 4) return local;
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`.trim();
  }
  return normalized;
}
