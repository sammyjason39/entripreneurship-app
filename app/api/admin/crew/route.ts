import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { createCrewAccount, listAdminCrewMembers } from '@/lib/admin-crew';
import { createServiceClient } from '@/lib/supabase/server';
import type { CrewAssignmentKind } from '@/lib/types';

export async function GET() {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  try {
    const members = await listAdminCrewMembers();
    return NextResponse.json({ members });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load crew' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const body = (await request.json()) as {
    email?: string;
    password?: string;
    full_name?: string;
    app_role?: 'crew' | 'admin';
    assignment_kind?: CrewAssignmentKind;
    station_id?: string | null;
    assignment_label?: string;
    notes?: string;
  };

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const fullName = body.full_name?.trim();
  const appRole = body.app_role === 'admin' ? 'admin' : 'crew';
  const assignmentKind = body.assignment_kind ?? 'general';

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Email and password (8+ characters) are required' },
      { status: 400 }
    );
  }
  if (!fullName) {
    return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
  }

  let stationName: string | null = null;
  if (body.station_id) {
    const service = await createServiceClient();
    const { data: station } = await service
      .from('stations')
      .select('name')
      .eq('id', body.station_id)
      .single();
    stationName = station?.name ?? null;
  }

  try {
    const result = await createCrewAccount({
      email,
      password,
      fullName,
      appRole,
      assignmentKind,
      stationId: body.station_id ?? null,
      assignmentLabel: body.assignment_label,
      notes: body.notes ?? null,
      stationName,
      assignedBy: auth.user.id,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not create crew account' },
      { status: 400 }
    );
  }
}
