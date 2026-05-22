import { createServiceClient } from '@/lib/supabase/server';
import { stationPercentToLatLng } from '@/lib/event-map';

export type StationVisitRow = {
  id: string;
  team_id: string;
  station_id: string;
  checked_in_at: string;
  checked_in_by: string;
  checked_out_at: string | null;
  checked_out_by: string | null;
  status: 'active' | 'completed';
  teams?: { name: string } | { name: string }[] | null;
  stations?: { number: number; name: string; map_x: number | null; map_y: number | null } | null;
  profiles?: { full_name: string } | null;
};

export type TeamMovementStatus = {
  teamId: string;
  teamName: string;
  currentStation: { id: string; number: number; name: string } | null;
  checkedInAt: string | null;
  previousStation: { number: number; name: string } | null;
  leftAt: string | null;
  minutesSinceLeft: number | null;
};

export function minutesAgo(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

export async function findStationByCheckinToken(token: string) {
  const service = await createServiceClient();
  const { data, error } = await service
    .from('stations')
    .select('id, number, name, checkin_token, is_active')
    .eq('checkin_token', token.trim())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/** Team scans station QR — auto-checkout from any other active station. */
export async function checkInTeamAtStation(params: {
  teamId: string;
  stationId: string;
  userId: string;
}) {
  const service = await createServiceClient();
  const now = new Date().toISOString();

  const { data: activeElsewhere } = await service
    .from('station_visits')
    .select('id, station_id')
    .eq('team_id', params.teamId)
    .eq('status', 'active');

  for (const visit of activeElsewhere ?? []) {
    if (visit.station_id === params.stationId) {
      return { ok: true as const, alreadyHere: true, visitId: visit.id };
    }
    await service
      .from('station_visits')
      .update({
        status: 'completed',
        checked_out_at: now,
        checked_out_by: null,
      })
      .eq('id', visit.id);
  }

  const { data: created, error } = await service
    .from('station_visits')
    .insert({
      team_id: params.teamId,
      station_id: params.stationId,
      checked_in_by: params.userId,
      status: 'active',
    })
    .select('id, checked_in_at')
    .single();

  if (error) throw new Error(error.message);

  const { data: station } = await service
    .from('stations')
    .select('number, name, map_x, map_y')
    .eq('id', params.stationId)
    .single();

  if (station?.map_x != null && station.map_y != null) {
    const [lat, lng] = stationPercentToLatLng(station.map_x, station.map_y);
    await service.from('location_pings').insert({
      user_id: params.userId,
      team_id: params.teamId,
      lat,
      lng,
    });
  }

  return {
    ok: true as const,
    alreadyHere: false,
    visitId: created.id,
    checkedInAt: created.checked_in_at,
    station,
  };
}

export async function checkOutTeamVisit(params: {
  visitId: string;
  crewUserId: string;
}) {
  const service = await createServiceClient();
  const now = new Date().toISOString();

  const { data: visit, error: findErr } = await service
    .from('station_visits')
    .select('id, status, station_id, team_id')
    .eq('id', params.visitId)
    .single();

  if (findErr || !visit) return { ok: false as const, error: 'not_found' };
  if (visit.status !== 'active') return { ok: false as const, error: 'not_active' };

  const { error } = await service
    .from('station_visits')
    .update({
      status: 'completed',
      checked_out_at: now,
      checked_out_by: params.crewUserId,
    })
    .eq('id', params.visitId);

  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function getActiveVisitForTeam(teamId: string, stationId?: string) {
  const service = await createServiceClient();
  let q = service
    .from('station_visits')
    .select('*, stations(id, number, name)')
    .eq('team_id', teamId)
    .eq('status', 'active');

  if (stationId) q = q.eq('station_id', stationId);

  const { data } = await q.maybeSingle();
  return data as StationVisitRow | null;
}

export async function listActiveVisitsAtStation(stationId: string) {
  const service = await createServiceClient();
  const { data, error } = await service
    .from('station_visits')
    .select('*, teams(name)')
    .eq('station_id', stationId)
    .eq('status', 'active')
    .order('checked_in_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as StationVisitRow[];
}

export async function getTeamMovementOverview(): Promise<TeamMovementStatus[]> {
  const service = await createServiceClient();

  const { data: teams, error: tErr } = await service.from('teams').select('id, name').order('name');
  if (tErr) throw new Error(tErr.message);

  const { data: visits, error: vErr } = await service
    .from('station_visits')
    .select('*, stations(number, name)')
    .order('checked_in_at', { ascending: false });

  if (vErr) throw new Error(vErr.message);

  const activeByTeam = new Map<string, StationVisitRow>();
  const lastCompletedByTeam = new Map<string, StationVisitRow>();

  for (const v of (visits ?? []) as StationVisitRow[]) {
    if (v.status === 'active' && !activeByTeam.has(v.team_id)) {
      activeByTeam.set(v.team_id, v);
    }
    if (v.status === 'completed' && !lastCompletedByTeam.has(v.team_id)) {
      lastCompletedByTeam.set(v.team_id, v);
    }
  }

  return (teams ?? []).map((t) => {
    const active = activeByTeam.get(t.id);
    const prev = lastCompletedByTeam.get(t.id);
    const st = active?.stations;
    const station = Array.isArray(st) ? st[0] : st;
    const prevSt = prev?.stations;
    const prevStation = Array.isArray(prevSt) ? prevSt[0] : prevSt;

    let previousStation: TeamMovementStatus['previousStation'] = null;
    let leftAt: string | null = null;
    let minutesSinceLeft: number | null = null;

    if (active) {
      const completed = ((visits ?? []) as StationVisitRow[])
        .filter((v) => v.team_id === t.id && v.status === 'completed' && v.checked_out_at)
        .sort(
          (a, b) =>
            new Date(b.checked_out_at!).getTime() - new Date(a.checked_out_at!).getTime()
        );
      const lastLeft = completed[0];
      if (lastLeft) {
        const ps = lastLeft.stations;
        const pStation = Array.isArray(ps) ? ps[0] : ps;
        if (pStation) {
          previousStation = { number: pStation.number, name: pStation.name };
          leftAt = lastLeft.checked_out_at;
          if (leftAt) minutesSinceLeft = minutesAgo(leftAt);
        }
      }
    } else if (prev && prevStation) {
      previousStation = { number: prevStation.number, name: prevStation.name };
      leftAt = prev.checked_out_at ?? prev.checked_in_at;
      if (leftAt) minutesSinceLeft = minutesAgo(leftAt);
    }

    return {
      teamId: t.id,
      teamName: t.name,
      currentStation: station
        ? { id: active!.station_id, number: station.number, name: station.name }
        : null,
      checkedInAt: active?.checked_in_at ?? null,
      previousStation,
      leftAt,
      minutesSinceLeft,
    };
  });
}
