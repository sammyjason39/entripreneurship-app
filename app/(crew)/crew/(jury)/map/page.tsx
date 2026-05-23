import { SimpleEventMap } from '@/components/app/SimpleEventMap';

export default function CrewMapPage() {
  return (
    <main>
      <p className="px-4 pt-4 font-display text-lg">EVENT MAP</p>
      <p className="px-4 pb-2 font-body text-[10px] text-text-secondary">
        Peta rute acara — lihat posisi tim di halaman Tracking
      </p>
      <div className="px-4 pb-4">
        <SimpleEventMap />
      </div>
    </main>
  );
}
