import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin-auth';
import { upsertCrewAssignment } from '@/lib/admin-crew';
import { createServiceClient } from '@/lib/supabase/server';
import type { AppRole, CrewAssignmentKind } from '@/lib/types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await requireAdminApi();
  if ('error' in auth) return auth.error;

  const { userId } = await params;
  const body = (await request.json()) as {
    full_name?: string;
    app_role?: AppRole;
    assignment_kind?: CrewAssignmentKind;
    station_id?: string | null;
    assignment_label?: string;
    notes?: string | null;
    password?: string;
  };

  const service = await createServiceClient();

  if (body.password && body.password.length >= 8) {
    const { error: pwError } = await service.auth.admin.updateUserById(userId, {
      password: body.password,
    });
    if (pwError) {
      return NextResponse.json({ error: pwError.message }, { status: 400 });
    }
  }

  if (body.full_name || body.app_role) {
    const updates: Record<string, string | boolean> = {};
    if (body.full_name?.trim()) updates.full_name = body.full_name.trim();
    if (body.app_role && ['crew', 'admin', 'participant'].includes(body.app_role)) {
      updates.app_role = body.app_role;
      if (body.app_role === 'crew' || body.app_role === 'admin') {
        updates.onboarding_complete = true;
      }
    }
    const { error: profileError } = await service
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }
  }

  if (body.assignment_kind) {
    let stationName: string | null = null;
    if (body.station_id) {
      const { data: station } = await service
        .from('stations')
        .select('name')
        .eq('id', body.station_id)
        .single();
      stationName = station?.name ?? null;
    }

    try {
      await upsertCrewAssignment({
        userId,
        assignmentKind: body.assignment_kind,
        stationId: body.station_id ?? null,
        assignmentLabel: body.assignment_label,
        notes: body.notes,
        stationName,
        assignedBy: auth.user.id,
      });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Assignment update failed' },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
