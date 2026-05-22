export function teamNameFromJoin(teams: unknown): string {
  if (!teams) return '?';
  if (Array.isArray(teams)) return (teams[0] as { name?: string })?.name ?? '?';
  return (teams as { name?: string }).name ?? '?';
}

export function teamBalanceFromJoin(teams: unknown): number {
  if (!teams) return 0;
  const t = Array.isArray(teams) ? teams[0] : teams;
  return (t as { balance?: number })?.balance ?? 0;
}

export function teamFromJoin(teams: unknown): { name: string; join_code: string } | null {
  if (!teams) return null;
  const t = Array.isArray(teams) ? teams[0] : teams;
  if (!t || typeof t !== 'object') return null;
  const o = t as { name?: string; join_code?: string };
  return { name: o.name ?? '?', join_code: o.join_code ?? '' };
}

export function profileNameFromJoin(profiles: unknown): string {
  if (!profiles) return '?';
  if (Array.isArray(profiles)) return (profiles[0] as { full_name?: string })?.full_name ?? '?';
  return (profiles as { full_name?: string }).full_name ?? '?';
}
