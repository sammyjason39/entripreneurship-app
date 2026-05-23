'use client';

import Image from 'next/image';

export const EVENT_MAP_IMAGE = '/map/event-map.jpeg';

export function SimpleEventMap() {
  return (
    <div className="relative w-full overflow-hidden rounded-card border-2 border-border bg-bg-secondary">
      <Image
        src={EVENT_MAP_IMAGE}
        alt="Peta perjalanan EnTripreneurship — Dago"
        width={1200}
        height={1600}
        className="h-auto w-full object-contain"
        priority
        unoptimized
      />
    </div>
  );
}
