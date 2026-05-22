import { NextResponse } from 'next/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';
import { listActiveVisitsAtStation } from '@/lib/station-visits';

export async function GET(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  if (auth.profile.app_role !== 'crew' && auth.profile.app_role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const stationId = new URL(request.url).searchParams.get('stationId')?.trim();
  if (!stationId) {
    return NextResponse.json({ error: 'stationId required' }, { status: 400 });
  }

  try {
    const visits = await listActiveVisitsAtStation(stationId);
    return NextResponse.json({ visits });
  } catch (e) {
    console.error('stations/active', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
