'use client';

import { useEffect } from 'react';

export function useLocationPing(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !navigator.geolocation) return;

    const ping = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetch('/api/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          }).catch(() => {});
        },
        () => {},
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
      );
    };

    ping();
    const id = setInterval(ping, 60000);
    return () => clearInterval(id);
  }, [enabled]);
}
