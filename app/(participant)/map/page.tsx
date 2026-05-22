'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapView } from '@/components/app/MapView';
import type { Station } from '@/lib/types';

export default function MapPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('stations')
      .select('*')
      .order('number')
      .then(({ data }) => setStations((data as Station[]) ?? []));
  }, []);

  return (
    <main>
      <p className="px-4 pt-4 font-display text-lg">MAP</p>
      <MapView
        stations={stations}
        selectedId={selectedId}
        onPinClick={(s) => setSelectedId(s.id)}
      />
    </main>
  );
}
