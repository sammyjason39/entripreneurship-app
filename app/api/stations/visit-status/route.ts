import { NextResponse } from 'next/server';
import { getAuthProfile, isNextResponse } from '@/lib/api-helpers';
import { getUserTeamId } from '@/lib/auth';
import { getActiveVisitForTeam } from '@/lib/station-visits';

export async function GET(request: Request) {
  const auth = await getAuthProfile();
  if (isNextResponse(auth)) return auth;

  const stationId = new URL(request.url).searchParams.get('stationId')?.trim();
  if (!stationId) {
    return NextResponse.json({ error: 'stationId required' }, { status: 400 });
  }

  const teamId = await getUserTeamId(auth.userId);
  if (!teamId) {
    return NextResponse.json({ checkedIn: false });
  }

  const visit = await getActiveVisitForTeam(teamId, stationId);
  return NextResponse.json({
    checkedIn: !!visit,
    checkedInAt: visit?.checked_in_at ?? null,
  });
}
