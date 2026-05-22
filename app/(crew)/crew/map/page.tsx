'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapView } from '@/components/app/MapView';
import type { TeamMapPing } from '@/components/app/EventLeafletMap';
import type { Station } from '@/lib/types';
import { teamNameFromJoin } from '@/lib/supabase-helpers';
import { stationPercentToLatLng } from '@/lib/event-map';

export default function CrewMapPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [teamPings, setTeamPings] = useState<TeamMapPing[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('stations').select('*').order('number').then(({ data }) => {
      setStations((data as Station[]) ?? []);
    });

    const load = async () => {
      const { data: activeVisits } = await supabase
        .from('station_visits')
        .select('team_id, stations(number, name, map_x, map_y), teams(name)')
        .eq('status', 'active');

      const fromVisits: TeamMapPing[] = [];
      for (const v of activeVisits ?? []) {
        const st = Array.isArray(v.stations) ? v.stations[0] : v.stations;
        if (!st || st.map_x == null || st.map_y == null || !v.team_id) continue;
        const [lat, lng] = stationPercentToLatLng(st.map_x, st.map_y);
        fromVisits.push({
          team: `${teamNameFromJoin(v.teams)} @ Pos ${st.number}`,
          lat,
          lng,
        });
      }

      if (fromVisits.length > 0) {
        setTeamPings(fromVisits);
        return;
      }

      const { data } = await supabase
        .from('location_pings')
        .select('lat, lng, team_id, teams(name), pinged_at')
        .order('pinged_at', { ascending: false });

      const seen = new Set<string>();
      const latest: TeamMapPing[] = [];
      data?.forEach((p) => {
        if (!p.team_id || seen.has(p.team_id)) return;
        seen.add(p.team_id);
        latest.push({
          team: teamNameFromJoin(p.teams),
          lat: p.lat,
          lng: p.lng,
        });
      });
      setTeamPings(latest);
    };

    load();
    const channel = supabase
      .channel('location-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'location_pings' }, load)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'station_visits' },
        load
      )
      .subscribe();

    const poll = setInterval(load, 30000);
    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main>
      <p className="px-4 pt-4 font-display text-lg">LIVE MAP</p>
      <p className="px-4 pb-2 font-body text-[10px] text-text-secondary">
        Teams at a station (from QR check-in) · fallback GPS if none
      </p>
      <MapView stations={stations} teamPings={teamPings} />
    </main>
  );
}
