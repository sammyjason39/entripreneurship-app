'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import type { Station } from '@/lib/types';
import {
  EVENT_MAP_BOUNDS,
  EVENT_MAP_IMAGE_URL,
  EVENT_CENTER,
  stationPercentToLatLng,
} from '@/lib/event-map';

export type TeamMapPing = {
  team: string;
  lat: number;
  lng: number;
};

interface EventLeafletMapProps {
  stations: Station[];
  teamPings?: TeamMapPing[];
  myPosition?: { lat: number; lng: number } | null;
  selectedId?: string | null;
  onStationClick?: (station: Station) => void;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stationIconHtml(number: number, selected: boolean): string {
  const ring = selected ? 'box-shadow:0 0 14px #39ff14;' : '';
  return `<span style="display:flex;height:32px;width:32px;align-items:center;justify-content:center;border-radius:9999px;border:2px solid #39ff14;background:#1a1a2e;font:bold 11px monospace;color:#39ff14;${ring}">${number}</span>`;
}

function teamIconHtml(label: string): string {
  const short = label.length > 12 ? `${label.slice(0, 10)}…` : label;
  return `<span style="display:flex;max-width:120px;padding:2px 6px;border-radius:4px;border:2px solid #00d4ff;background:#0d1b2a;font:bold 10px monospace;color:#00d4ff;white-space:nowrap;">${escapeHtml(short)}</span>`;
}

export function EventLeafletMap({
  stations,
  teamPings = [],
  myPosition = null,
  selectedId,
  onStationClick,
}: EventLeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: LeafletMap;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;

      if (cancelled || !containerRef.current) return;

      map = L.map(containerRef.current, {
        center: [EVENT_CENTER.lat, EVENT_CENTER.lng],
        zoom: 17,
        minZoom: 15,
        maxZoom: 20,
        zoomControl: true,
        attributionControl: false,
      });

      L.imageOverlay(EVENT_MAP_IMAGE_URL, EVENT_MAP_BOUNDS).addTo(map);
      map.fitBounds(EVENT_MAP_BOUNDS, { padding: [12, 12] });
      map.setMaxBounds(
        L.latLngBounds(EVENT_MAP_BOUNDS).pad(0.15)
      );

      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = markersRef.current;
    if (!map || !group) return;

    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled) return;

      group.clearLayers();

      for (const s of stations) {
        if (s.map_x == null || s.map_y == null) continue;
        const [lat, lng] = stationPercentToLatLng(s.map_x, s.map_y);
        const selected = s.id === selectedId;
        const marker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'entrip-marker-wrap',
            html: stationIconHtml(s.number, selected),
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
          zIndexOffset: selected ? 1000 : 500,
        });
        marker.on('click', () => onStationClick?.(s));
        marker.addTo(group);
      }

      for (const ping of teamPings) {
        const marker = L.marker([ping.lat, ping.lng], {
          icon: L.divIcon({
            className: 'entrip-marker-wrap',
            html: teamIconHtml(ping.team),
            iconAnchor: [0, 20],
          }),
          zIndexOffset: 800,
        });
        marker.addTo(group);
      }

      if (myPosition) {
        L.circleMarker([myPosition.lat, myPosition.lng], {
          radius: 10,
          color: '#ff6b35',
          fillColor: '#ff6b35',
          fillOpacity: 0.85,
          weight: 3,
        }).addTo(group);

        L.marker([myPosition.lat, myPosition.lng], {
          icon: L.divIcon({
            className: 'entrip-marker-wrap',
            html: `<span style="font:bold 10px monospace;color:#ff6b35;margin-left:12px;">YOU</span>`,
            iconAnchor: [0, 0],
          }),
          zIndexOffset: 1200,
        }).addTo(group);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [stations, teamPings, myPosition, selectedId, onStationClick]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[280px] w-full rounded-card border border-border bg-bg-primary [&_.leaflet-container]:rounded-card [&_.leaflet-container]:bg-bg-primary"
    />
  );
}
