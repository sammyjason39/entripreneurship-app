import { NextResponse } from 'next/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';
import { getUserTeamId } from '@/lib/auth';
import { checkInTeamAtStation, findStationByCheckinToken } from '@/lib/station-visits';

export async function POST(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  if (auth.profile.app_role !== 'participant') {
    return NextResponse.json({ error: 'Participants only' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'token required' }, { status: 400 });
    }

    const teamId = await getUserTeamId(auth.userId);
    if (!teamId) {
      return NextResponse.json({ error: 'Join a team first' }, { status: 400 });
    }

    const station = await findStationByCheckinToken(token);
    if (!station || !station.is_active) {
      return NextResponse.json({ error: 'Unknown station QR' }, { status: 404 });
    }

    const result = await checkInTeamAtStation({
      teamId,
      stationId: station.id,
      userId: auth.userId,
    });

    return NextResponse.json({
      ok: true,
      alreadyHere: result.alreadyHere,
      visitId: result.visitId,
      station: {
        id: station.id,
        number: station.number,
        name: station.name,
      },
      checkedInAt: 'checkedInAt' in result ? result.checkedInAt : undefined,
      message: result.alreadyHere
        ? `Already checked in at ${station.name}`
        : `Checked in at ${station.name}`,
    });
  } catch (e) {
    console.error('stations/check-in', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
