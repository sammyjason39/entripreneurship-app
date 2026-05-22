import Link from 'next/link';
import { requireCrewMember } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function CrewPayPage() {
  await requireCrewMember();

  return (
    <main className="space-y-4 p-4 text-on-bg-readable">
      <div>
        <h1 className="font-display text-lg font-bold">EnCoin payments</h1>
        <p className="mt-1 font-body text-sm text-text-on-bg-muted">
          Add or remove points from any team. You will enter your crew PIN to confirm.
        </p>
      </div>

      <Card className="space-y-3">
        <p className="font-display text-xs font-bold text-text-on-surface">ADD POINTS</p>
        <p className="font-body text-xs text-text-secondary">
          Scan a participant QR or use a preset reward QR.
        </p>
        <div className="grid gap-2">
          <Link href="/crew/scan">
            <Button className="w-full">SCAN PARTICIPANT QR</Button>
          </Link>
          <Link href="/crew/qr">
            <Button variant="outline" className="w-full">
              SHOW REWARD QR
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="font-display text-xs font-bold text-text-on-surface">DEDUCT POINTS</p>
        <p className="font-body text-xs text-text-secondary">
          Remove EnCoins from a team (shop purchase, penalty, correction).
        </p>
        <Link href="/crew/pay/deduct">
          <Button variant="outline" className="w-full">
            DEDUCT FROM TEAM
          </Button>
        </Link>
      </Card>
    </main>
  );
}
