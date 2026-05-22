import type { QrPayload } from './types';

export function buildStaticQrPayload(qrToken: string): string {
  const payload: QrPayload = { type: 'static', token: qrToken };
  return JSON.stringify(payload);
}

export function buildSessionQrPayload(sessionToken: string): string {
  const payload: QrPayload = { type: 'session', token: sessionToken };
  return JSON.stringify(payload);
}

/** Fixed QR at each station — teams scan to check in. */
export function buildStationCheckinQr(checkinToken: string, stationId: string): string {
  const payload: QrPayload = { type: 'station', token: checkinToken, stationId };
  return JSON.stringify(payload);
}
