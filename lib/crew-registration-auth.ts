import { requireAuth } from '@/lib/auth';
import { getCrewAssignment } from '@/lib/crew-assignment';
import { NextResponse } from 'next/server';

export async function requireRegistrationCrewApi() {
  const { user, profile } = await requireAuth();
  if (profile.app_role !== 'crew') {
    return { error: NextResponse.json({ error: 'Crew only' }, { status: 403 }) } as const;
  }
  const assignment = await getCrewAssignment(user.id);
  if (assignment?.assignment_kind !== 'registration') {
    return {
      error: NextResponse.json(
        { error: 'Only registration desk crew can add participants here' },
        { status: 403 }
      ),
    } as const;
  }
  return { user, profile, assignment } as const;
}
