import Link from 'next/link';
import { requireParticipant } from '@/lib/auth';
import { getTeamForUser } from '@/lib/team';
import { BalanceCard } from '@/components/app/BalanceCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default async function BankPage() {
  const { user } = await requireParticipant();
  const teamData = await getTeamForUser(user.id);

  if (!teamData) {
    return <p className="p-4 text-text-secondary">No team found.</p>;
  }

  return (
    <main className="space-y-6 p-4">
      <BalanceCard balance={teamData.team.balance} teamName={teamData.team.name} large />

      <Card>
        <p className="font-display text-[10px] text-text-secondary mb-3">TEAM</p>
        <div className="flex flex-wrap gap-2">
          {teamData.members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 rounded-card border border-border px-2 py-1"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary font-display text-xs">
                {(m.profiles?.full_name ?? '?')[0]}
              </span>
              <div>
                <p className="font-body text-xs">{m.profiles?.full_name}</p>
                <p className="font-display text-[8px] text-accent-green">{m.team_role}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-3">
        <Link href="/bank/qr">
          <Button className="w-full">SHOW MY QR</Button>
        </Link>
        <Link href="/bank/scan">
          <Button variant="outline" className="w-full">
            SCAN QR
          </Button>
        </Link>
        <Link href="/bank/history">
          <Button variant="ghost" className="w-full">
            HISTORY
          </Button>
        </Link>
      </div>
    </main>
  );
}
