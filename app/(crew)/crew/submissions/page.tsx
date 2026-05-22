'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { ReviewActions } from '@/components/app/ReviewActions';
import { teamNameFromJoin } from '@/lib/supabase-helpers';

export default function CrewSubmissionsPage() {
  const [subs, setSubs] = useState<
    {
      id: string;
      status: string;
      submitted_at: string;
      teams: unknown;
      stations: unknown;
    }[]
  >([]);
  const [stationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      let q = supabase
        .from('submissions')
        .select('id, status, submitted_at, teams(name), stations(name, number)')
        .order('submitted_at', { ascending: false });
      if (statusFilter) q = q.eq('status', statusFilter);
      if (stationFilter) q = q.eq('station_id', stationFilter);
      const { data } = await q;
      setSubs((data ?? []) as typeof subs);
    };
    load();
    const supabase = createClient();
    const channel = supabase
      .channel('submissions-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [stationFilter, statusFilter]);

  return (
    <main className="p-4 space-y-4">
      <h1 className="font-display text-lg">SUBMISSIONS</h1>
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`font-display text-[9px] px-2 py-1 border rounded-card ${
              statusFilter === s ? 'border-accent-blue text-accent-blue' : 'border-border'
            }`}
          >
            {(s || 'all').toUpperCase()}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {subs.map((s) => (
          <Card key={s.id}>
            <p className="font-display text-xs">
              {teamNameFromJoin(s.teams)} — Pos{' '}
              {(Array.isArray(s.stations)
                ? (s.stations[0] as { number?: number })?.number
                : (s.stations as { number?: number })?.number) ?? '?'}
            </p>
            <p className="text-[10px] text-text-secondary">
              {(Array.isArray(s.stations)
                ? (s.stations[0] as { name?: string })?.name
                : (s.stations as { name?: string })?.name) ?? 'Station'}{' '}
              · {s.status}
            </p>
            {s.status === 'pending' && <ReviewActions submissionId={s.id} />}
          </Card>
        ))}
      </div>
    </main>
  );
}
