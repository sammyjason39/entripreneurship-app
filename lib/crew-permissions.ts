import type { CrewAssignment, CrewAssignmentKind, Profile } from '@/lib/types';

export type CrewPermissions = {
  canPay: boolean;
  canViewMap: boolean;
  canViewLeaderboard: boolean;
  canRegisterParticipants: boolean;
  assignmentLabel: string | null;
  assignmentKind: CrewAssignmentKind | null;
};

export function getCrewPermissions(
  profile: Profile,
  assignment: CrewAssignment | null
): CrewPermissions {
  const kind = assignment?.assignment_kind ?? null;
  return {
    canPay: profile.app_role === 'crew',
    canViewMap: profile.app_role === 'crew',
    canViewLeaderboard: profile.app_role === 'crew',
    canRegisterParticipants:
      profile.app_role === 'crew' && kind === 'registration',
    assignmentLabel: assignment?.assignment_label ?? null,
    assignmentKind: kind,
  };
}
