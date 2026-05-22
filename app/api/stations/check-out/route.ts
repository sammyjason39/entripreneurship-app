import { NextResponse } from 'next/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';
import { checkOutTeamVisit } from '@/lib/station-visits';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  if (auth.profile.app_role !== 'crew' && auth.profile.app_role !== 'admin') {
    return NextResponse.json({ error: 'Crew only' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const visitId = typeof body.visitId === 'string' ? body.visitId : '';
    if (!visitId) {
      return NextResponse.json({ error: 'visitId required' }, { status: 400 });
    }

    const result = await checkOutTeamVisit({
      visitId,
      crewUserId: auth.userId,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'Team checked out' });
  } catch (e) {
    console.error('stations/check-out', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
