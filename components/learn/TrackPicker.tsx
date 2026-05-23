'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EVENT_TRACKS, trackLabel } from '@/lib/event-tracks';
import type { CompanySlug } from '@/lib/content-types';

type Props = {
  currentTrack: CompanySlug | null;
  isCeo: boolean;
};

export function TrackPicker({ currentTrack, isCeo }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<CompanySlug | null>(currentTrack);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (currentTrack && !editing) {
    return (
      <Card className="border-accent-green/50 space-y-2">
        <p className="font-display text-xs text-accent-green">TREK TIM ANDA</p>
        <p className="font-display text-lg">{trackLabel(currentTrack)}</p>
        <p className="font-body text-xs text-text-secondary">
          Case study (Pos 1) dan innovation card (Pos 3) mengikuti perusahaan ini.
        </p>
        {isCeo && (
          <Button
            type="button"
            variant="outline"
            className="w-full text-xs"
            onClick={() => {
              setEditing(true);
              setSelected(currentTrack);
            }}
          >
            GANTI TREK
          </Button>
        )}
      </Card>
    );
  }

  if (!isCeo) {
    return (
      <Card className="border-accent-yellow/50">
        <p className="font-display text-xs text-accent-yellow">PILIH TREK</p>
        <p className="font-body text-sm">CEO tim harus memilih satu perusahaan (trek) dulu.</p>
      </Card>
    );
  }

  const save = async () => {
    if (!selected) {
      setError('Pilih satu trek perusahaan.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await fetch('/api/teams/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_track: selected }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError((data as { error?: string }).error ?? 'Gagal menyimpan');
      return;
    }
    setEditing(false);
    router.refresh();
  };

  return (
    <section className="space-y-3">
      <Card className="border-accent-yellow/50 space-y-2">
        <p className="font-display text-xs text-accent-yellow">PILIH TREK PERUSAHAAN</p>
        <p className="font-body text-sm text-text-secondary">
          Satu trek untuk seluruh tim. Timer lomba mulai saat trek dikonfirmasi. Modal awal & biaya
          transport otomatis saat check-in di Pos berikutnya.
        </p>
      </Card>
      <div className="space-y-2">
        {EVENT_TRACKS.map((t) => {
          const active = selected === t.slug;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => setSelected(t.slug)}
              className={`w-full text-left rounded border-2 p-3 transition-colors ${
                active
                  ? 'border-accent-green bg-accent-green/10'
                  : 'border-border bg-bg-secondary hover:border-accent-green/50'
              }`}
            >
              <p className="font-display text-sm">{t.company}</p>
              <p className="mt-1 font-body text-[10px] text-text-secondary">{t.headline}</p>
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-accent-red">{error}</p>}
      <div className="flex gap-2">
        {editing && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={loading}
            onClick={() => setEditing(false)}
          >
            BATAL
          </Button>
        )}
        <Button
          type="button"
          className="flex-1"
          disabled={loading || !selected}
          onClick={save}
        >
          {loading ? 'MENYIMPAN...' : 'KONFIRMASI TREK TIM'}
        </Button>
      </div>
    </section>
  );
}
