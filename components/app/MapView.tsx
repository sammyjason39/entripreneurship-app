'use client';

import Link from 'next/link';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { Station } from '@/lib/types';

interface MapViewProps {
  stations: Station[];
  onPinClick?: (station: Station) => void;
  selectedId?: string | null;
}

export function MapView({ stations, onPinClick, selectedId }: MapViewProps) {
  const selected = stations.find((s) => s.id === selectedId);

  return (
    <div className="relative h-[calc(100dvh-8rem)] w-full">
      <TransformWrapper initialScale={1} minScale={0.8} maxScale={3} centerOnInit>
        <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full">
          <div className="relative w-full min-w-[360px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/map/dago-map.svg"
              alt="Dago Pakar Map"
              className="h-auto w-full"
            />
            {stations.map((s) =>
              s.map_x != null && s.map_y != null ? (
                <button
                  key={s.id}
                  type="button"
                  className="absolute -translate-x-1/2 -translate-y-full"
                  style={{ left: `${s.map_x}%`, top: `${s.map_y}%` }}
                  onClick={() => onPinClick?.(s)}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent-green bg-bg-primary font-display text-[10px] text-accent-green shadow-[0_0_12px_#4ade80]">
                    {s.number}
                  </span>
                </button>
              ) : null
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {selected && (
        <div className="absolute bottom-4 left-4 right-4 rounded-card border border-border bg-bg-secondary p-4 shadow-lg">
          <p className="font-display text-sm">{selected.name}</p>
          <p className="mt-1 font-body text-xs text-text-secondary">{selected.tagline}</p>
          <Link
            href={`/missions/${selected.id}`}
            className="mt-3 inline-block font-display text-xs text-accent-green"
          >
            OPEN MISSION →
          </Link>
        </div>
      )}
    </div>
  );
}
