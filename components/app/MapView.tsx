'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { Station } from '@/lib/types';
import type { TeamMapPing } from '@/components/app/EventLeafletMap';

const EventLeafletMap = dynamic(
  () => import('@/components/app/EventLeafletMap').then((m) => m.EventLeafletMap),
  { ssr: false, loading: () => <p className="animate-blink p-8 text-center font-display text-xs">LOADING MAP…</p> }
);

interface MapViewProps {
  stations: Station[];
  teamPings?: TeamMapPing[];
  myPosition?: { lat: number; lng: number } | null;
  onPinClick?: (station: Station) => void;
  selectedId?: string | null;
}

export function MapView({
  stations,
  teamPings,
  myPosition,
  onPinClick,
  selectedId,
}: MapViewProps) {
  const selected = stations.find((s) => s.id === selectedId);

  return (
    <div className="relative h-[calc(100dvh-8rem)] w-full min-h-[320px]">
      <EventLeafletMap
        stations={stations}
        teamPings={teamPings}
        myPosition={myPosition}
        selectedId={selectedId}
        onStationClick={onPinClick}
      />

      {selected && (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[1000] rounded-card border border-border bg-bg-secondary/95 p-4 shadow-lg backdrop-blur-sm">
          <p className="font-display text-sm">{selected.name}</p>
          <p className="mt-1 font-body text-xs text-text-secondary">{selected.tagline}</p>
          <Link
            href={`/missions/${selected.id}`}
            className="pointer-events-auto mt-3 inline-block font-display text-xs text-accent-green"
          >
            OPEN MISSION →
          </Link>
        </div>
      )}
    </div>
  );
}
