'use client';

import { SimpleEventMap } from '@/components/app/SimpleEventMap';

export function MapView() {
  return (
    <div className="px-4 pb-4">
      <SimpleEventMap />
      <p className="mt-3 font-body text-center text-[10px] text-text-secondary">
        Ikuti rute di peta ke setiap Pos. Scan QR di lokasi untuk check-in.
      </p>
    </div>
  );
}
