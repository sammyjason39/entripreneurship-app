'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapView } from '@/components/app/MapView';
import type { TeamMapPing } from '@/components/app/EventLeafletMap';
import type { Station } from '@/lib/types';
import { teamNameFromJoin } from '@/lib/supabase-helpers';

export default function CrewMapPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [teamPings, setTeamPings] = useState<TeamMapPing[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('stations').select('*').order('number').then(({ data }) => {
      setStations((data as Station[]) ?? []);
    });

    const loadPings = async () => {
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

    loadPings();
    const channel = supabase
      .channel('location-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'location_pings' }, loadPings)
      .subscribe();

    const poll = setInterval(loadPings, 60000);
    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main>
      <p className="px-4 pt-4 font-display text-lg">LIVE MAP</p>
      <p className="px-4 pb-2 font-body text-[10px] text-text-secondary">
        {teamPings.length} teams reporting location on BINUS @ Dago
      </p>
      <MapView stations={stations} teamPings={teamPings} />
    </main>
  );
}
