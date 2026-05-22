import type { CrewAssignmentKind } from '@/lib/types';

export const CREW_ASSIGNMENT_KINDS: { value: CrewAssignmentKind; label: string }[] = [
  { value: 'jury', label: 'Jury panel' },
  { value: 'station', label: 'Station judge' },
  { value: 'bank', label: 'EnCoin bank desk' },
  { value: 'registration', label: 'Registration / check-in' },
  { value: 'roaming', label: 'Roaming crew' },
  { value: 'general', label: 'General crew' },
];

export function buildAssignmentLabel(
  kind: CrewAssignmentKind,
  stationName?: string | null,
  customLabel?: string
): string {
  if (customLabel?.trim()) return customLabel.trim();
  const preset = CREW_ASSIGNMENT_KINDS.find((k) => k.value === kind);
  if (kind === 'station' && stationName) return `Station — ${stationName}`;
  return preset?.label ?? 'Crew';
}
