import { MapView } from '@/components/app/MapView';

export default function MapPage() {
  return (
    <main>
      <p className="px-4 pt-4 font-display text-lg">MAP</p>
      <p className="px-4 pb-2 font-body text-[10px] text-text-secondary">
        Peta perjalanan acara — Dago, Bandung
      </p>
      <MapView />
    </main>
  );
}
