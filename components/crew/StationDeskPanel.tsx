'use client';

import { useCallback, useEffect, useState } from 'react';
import { QRDisplay } from '@/components/app/QRDisplay';
import { buildStationCheckinQr } from '@/lib/qr';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Station6CompetePanel } from '@/components/crew/Station6CompetePanel';

type ActiveVisit = {
  id: string;
  team_id: string;
  checked_in_at: string;
  teams?: { name: string } | { name: string }[] | null;
};

function teamName(teams: ActiveVisit['teams']): string {
  if (!teams) return 'Team';
  return Array.isArray(teams) ? teams[0]?.name ?? 'Team' : teams.name;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function minutesHere(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

interface StationDeskPanelProps {
  stationId: string;
  stationNumber: number;
  stationName: string;
  checkinToken: string;
}

export function StationDeskPanel({
  stationId,
  stationNumber,
  stationName,
  checkinToken,
}: StationDeskPanelProps) {
  const [visits, setVisits] = useState<ActiveVisit[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const qrValue = buildStationCheckinQr(checkinToken, stationId);

  const load = useCallback(async () => {
    const res = await fetch(`/api/stations/active?stationId=${encodeURIComponent(stationId)}`);
    const data = await res.json();
    if (res.ok) setVisits(data.visits ?? []);
  }, [stationId]);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const checkout = async (visitId: string) => {
    setLoading(visitId);
    await fetch('/api/stations/check-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitId }),
    });
    setLoading(null);
    load();
  };

  return (
    <div className="space-y-6">
      <Card className="text-center">
        <p className="font-display text-[10px] text-text-secondary">STATION QR — POS {stationNumber}</p>
        <p className="font-display text-sm">{stationName}</p>
        <div className="mt-4">
          <QRDisplay value={qrValue} label="Teams scan this to check in" />
        </div>
        <p className="mt-2 font-body text-[10px] text-text-secondary">
          Tampilkan QR ini di meja Pos — jangan di-scan oleh crew. Tim peserta scan lewat Missions → Scan
          station.
        </p>
      </Card>

      {stationNumber === 6 && <Station6CompetePanel visits={visits} />}

      <div>
        <h2 className="font-display text-sm">TEAMS HERE NOW ({visits.length})</h2>
        <p className="font-body text-[10px] text-text-secondary">
          Check out manually when they leave your station.
        </p>
        <div className="mt-3 space-y-2">
          {visits.length === 0 && (
            <p className="font-body text-sm text-text-secondary">No teams checked in yet.</p>
          )}
          {visits.map((v) => (
            <Card key={v.id} className="flex items-center justify-between gap-2">
              <div>
                <p className="font-display text-xs">{teamName(v.teams)}</p>
                <p className="font-body text-[10px] text-text-secondary">
                  Arrived {formatTime(v.checked_in_at)} · {minutesHere(v.checked_in_at)} min
                </p>
              </div>
              <Button
                variant="outline"
                className="shrink-0 text-accent-red"
                disabled={loading === v.id}
                onClick={() => checkout(v.id)}
              >
                {loading === v.id ? '…' : 'CHECK OUT'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
