import { describe, it, expect } from 'vitest';
import { generateJoinCode, parseQrData } from '../lib/utils';
import { isValidPin as pinValid } from '../lib/pin';

describe('generateJoinCode', () => {
  it('returns 6 alphanumeric chars', () => {
    const code = generateJoinCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });
});

describe('parseQrData', () => {
  it('parses JSON session QR', () => {
    const raw = JSON.stringify({ type: 'session', token: 'abc123' });
    expect(parseQrData(raw)).toEqual({ type: 'session', token: 'abc123' });
  });

  it('parses JSON static QR', () => {
    const raw = JSON.stringify({ type: 'static', token: 'deadbeef' });
    expect(parseQrData(raw)?.type).toBe('static');
  });
});

describe('PIN validation', () => {
  it('accepts 6 digits', () => {
    expect(pinValid('123456')).toBe(true);
  });
  it('rejects non-6 digit', () => {
    expect(pinValid('12345')).toBe(false);
  });
});
