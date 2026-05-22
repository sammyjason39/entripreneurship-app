'use client';

import { useLocationPing } from '@/hooks/useLocation';

export function LocationTracker({ enabled }: { enabled: boolean }) {
  useLocationPing(enabled);
  return null;
}
