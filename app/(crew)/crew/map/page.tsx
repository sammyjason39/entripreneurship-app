'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapView } from '@/components/app/MapView';
import type { Station } from '@/lib/types';
import { teamNameFromJoin } from '@/lib/supabase-helpers';

export default function CrewMapPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [dots, setDots] = useState<{ team: string; lat: number; lng: number }[]>([]);

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
      const latest: { team: string; lat: number; lng: number }[] = [];
      data?.forEach((p) => {
        if (!p.team_id || seen.has(p.team_id)) return;
        seen.add(p.team_id);
        latest.push({
          team: teamNameFromJoin(p.teams),
          lat: p.lat,
          lng: p.lng,
        });
      });
      setDots(latest);
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
      <p className="px-4 font-body text-[10px] text-text-secondary">
        {dots.length} teams with location
      </p>
      <MapView stations={stations} />
      <div className="p-4 space-y-1">
        {dots.map((d) => (
          <p key={d.team} className="font-body text-xs">
            {d.team} — {d.lat.toFixed(4)}, {d.lng.toFixed(4)}
          </p>
        ))}
      </div>
    </main>
  );
}
