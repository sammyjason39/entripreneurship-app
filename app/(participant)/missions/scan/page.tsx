'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRScanner } from '@/components/app/QRScanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parseQrData } from '@/lib/utils';

export default function StationScanPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async (raw: string) => {
    setError('');
    setMessage('');
    try {
      const parsed = parseQrData(raw);
      if (!parsed || parsed.type !== 'station') {
        setError('Bukan QR Pos. Scan poster check-in di station, bukan QR Bank peserta.');
        return;
      }

      setLoading(true);
      const res = await fetch('/api/stations/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: parsed.token }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        station?: { id?: string };
      };
      setLoading(false);

      if (!res.ok) {
        setError(data.error ?? 'Check-in gagal');
        return;
      }

      setMessage(data.message ?? 'Checked in!');
      setTimeout(() => {
        if (data.station?.id) router.push(`/missions/${data.station.id}`);
        else router.push('/missions');
      }, 1500);
    } catch {
      setLoading(false);
      setError('Gagal check-in. Coba lagi.');
    }
  };

  return (
    <main className="space-y-4 p-4">
      <div>
        <Link href="/missions" className="font-display text-xs text-accent-green">
          ← MISSIONS
        </Link>
        <h1 className="mt-2 font-display text-lg">SCAN STATION QR</h1>
        <p className="mt-1 font-body text-xs text-text-secondary">
          Any team member can scan. Your CEO submits the mission after check-in.
        </p>
      </div>

      {loading ? (
        <Card>
          <p className="animate-blink text-center font-display text-sm">CHECKING IN…</p>
        </Card>
      ) : (
        <QRScanner onScan={handleScan} />
      )}

      {message && <p className="text-center text-sm text-accent-green">{message}</p>}
      {error && <p className="text-center text-sm text-accent-red">{error}</p>}

      <Link href="/missions">
        <Button variant="outline" className="w-full">
          BACK TO MISSIONS
        </Button>
      </Link>
    </main>
  );
}
