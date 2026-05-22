import { createServiceClient } from '@/lib/supabase/server';
import { buildAssignmentLabel } from '@/lib/admin';
import type { AdminCrewMember, AppRole, CrewAssignmentKind } from '@/lib/types';

export async function listAdminCrewMembers(): Promise<AdminCrewMember[]> {
  const service = await createServiceClient();
  const { data: profiles, error } = await service
    .from('profiles')
    .select('id, full_name, app_role, onboarding_complete, created_at')
    .in('app_role', ['crew', 'admin'])
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const { data: assignments } = await service
    .from('crew_assignments')
    .select('*, stations(id, number, name)');

  const assignmentByUser = new Map(
    (assignments ?? []).map((a) => [a.user_id, a])
  );

  const members: AdminCrewMember[] = [];

  for (const p of profiles ?? []) {
    const { data: authData } = await service.auth.admin.getUserById(p.id);
    members.push({
      id: p.id,
      email: authData.user?.email ?? '—',
      full_name: p.full_name,
      app_role: p.app_role as AppRole,
      onboarding_complete: p.onboarding_complete,
      created_at: p.created_at,
      assignment: (assignmentByUser.get(p.id) as AdminCrewMember['assignment']) ?? null,
    });
  }

  return members;
}

export async function upsertCrewAssignment(params: {
  userId: string;
  assignmentKind: CrewAssignmentKind;
  stationId: string | null;
  assignmentLabel?: string;
  notes?: string | null;
  stationName?: string | null;
  assignedBy: string;
}) {
  const service = await createServiceClient();
  const label = buildAssignmentLabel(
    params.assignmentKind,
    params.stationName,
    params.assignmentLabel
  );

  const { error } = await service.from('crew_assignments').upsert(
    {
      user_id: params.userId,
      assignment_label: label,
      assignment_kind: params.assignmentKind,
      station_id: params.stationId,
      notes: params.notes ?? null,
      assigned_by: params.assignedBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) throw new Error(error.message);
}

export async function createCrewAccount(params: {
  email: string;
  password: string;
  fullName: string;
  appRole: 'crew' | 'admin';
  assignmentKind: CrewAssignmentKind;
  stationId: string | null;
  assignmentLabel?: string;
  notes?: string | null;
  stationName?: string | null;
  assignedBy: string;
}) {
  const service = await createServiceClient();

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email: params.email.trim().toLowerCase(),
    password: params.password,
    email_confirm: true,
    user_metadata: { full_name: params.fullName.trim() },
  });

  if (createError || !created.user) {
    throw new Error(createError?.message ?? 'Could not create user');
  }

  const userId = created.user.id;

  const { error: profileError } = await service
    .from('profiles')
    .update({
      full_name: params.fullName.trim(),
      app_role: params.appRole,
      onboarding_complete: true,
    })
    .eq('id', userId);

  if (profileError) throw new Error(profileError.message);

  await upsertCrewAssignment({
    userId,
    assignmentKind: params.assignmentKind,
    stationId: params.stationId,
    assignmentLabel: params.assignmentLabel,
    notes: params.notes,
    stationName: params.stationName,
    assignedBy: params.assignedBy,
  });

  return { userId, email: created.user.email ?? params.email };
}
