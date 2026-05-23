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
  const isCrew = profile.app_role === 'crew';
  const isAdmin = profile.app_role === 'admin';
  return {
    canPay: isCrew,
    canViewMap: isCrew || isAdmin,
    canViewLeaderboard: isCrew || isAdmin,
    canRegisterParticipants: isCrew && kind === 'registration',
    assignmentLabel: assignment?.assignment_label ?? null,
    assignmentKind: kind,
  };
}
