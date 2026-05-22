import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateSessionToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export function formatEnCoins(amount: number): string {
  return `${amount.toLocaleString('id-ID')} EC`;
}

export function parseQrData(raw: string): { type: 'static' | 'session'; token: string } | null {
  try {
    const parsed = JSON.parse(raw) as { type?: string; token?: string };
    if (
      (parsed.type === 'static' || parsed.type === 'session') &&
      typeof parsed.token === 'string'
    ) {
      return { type: parsed.type, token: parsed.token };
    }
  } catch {
    if (/^[a-f0-9]{32}$/i.test(raw.trim())) {
      return { type: 'static', token: raw.trim() };
    }
    if (/^[a-z0-9]{8,16}$/i.test(raw.trim())) {
      return { type: 'session', token: raw.trim() };
    }
  }
  return null;
}
