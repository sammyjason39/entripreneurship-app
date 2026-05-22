import { NextResponse } from 'next/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';
import { getTeamMovementOverview } from '@/lib/station-visits';

export async function GET() {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  if (auth.profile.app_role !== 'crew' && auth.profile.app_role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const teams = await getTeamMovementOverview();
    return NextResponse.json({ teams });
  } catch (e) {
    console.error('stations/tracking', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
