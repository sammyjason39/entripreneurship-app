'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapView } from '@/components/app/MapView';
import type { TeamMapPing } from '@/components/app/EventLeafletMap';
import type { Station } from '@/lib/types';
import { teamNameFromJoin } from '@/lib/supabase-helpers';

export default function MapPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [myPosition, setMyPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [teamPing, setTeamPing] = useState<TeamMapPing | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('stations')
      .select('*')
      .order('number')
      .then(({ data }) => setStations((data as Station[]) ?? []));

    const loadTeamPing = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from('team_members')
        .select('team_id, teams(name)')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!member?.team_id) return;

      const { data: ping } = await supabase
        .from('location_pings')
        .select('lat, lng, pinged_at')
        .eq('team_id', member.team_id)
        .order('pinged_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ping) {
        setTeamPing({
          team: teamNameFromJoin(member.teams),
          lat: ping.lat,
          lng: ping.lng,
        });
        setMyPosition({ lat: ping.lat, lng: ping.lng });
      }
    };

    loadTeamPing();
    const channel = supabase
      .channel('map-my-team')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'location_pings' }, loadTeamPing)
      .subscribe();

    const geoId =
      typeof navigator !== 'undefined' && navigator.geolocation
        ? navigator.geolocation.watchPosition(
            (pos) => {
              setMyPosition({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
          )
        : null;

    return () => {
      if (geoId != null) navigator.geolocation.clearWatch(geoId);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main>
      <p className="px-4 pt-4 font-display text-lg">MAP</p>
      <p className="px-4 pb-2 font-body text-[10px] text-text-secondary">
        Orange dot = your GPS · Cyan label = latest team ping · Green = stations
      </p>
      <MapView
        stations={stations}
        teamPings={teamPing ? [teamPing] : []}
        myPosition={myPosition}
        selectedId={selectedId}
        onPinClick={(s) => setSelectedId(s.id)}
      />
    </main>
  );
}
