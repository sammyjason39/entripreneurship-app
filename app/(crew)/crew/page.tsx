import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireCrew } from '@/lib/auth';
import { getCrewAssignment } from '@/lib/crew-assignment';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function CrewHomePage() {
  const { user } = await requireCrew();
  const assignment = await getCrewAssignment(user.id);
  const supabase = await createClient();

  const { count: teamCount } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true });
  const { count: memberCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true });
  const { count: pendingCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  const { data: txSum } = await supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'reward');

  const totalPoints = txSum?.reduce((a, t) => a + t.amount, 0) ?? 0;

  const links = [
    { href: '/crew/teams', label: 'Teams' },
    { href: '/crew/submissions', label: 'Submissions' },
    { href: '/crew/scan', label: 'Scan QR' },
    { href: '/crew/qr', label: 'Give Points QR' },
    { href: '/crew/map', label: 'Live Map' },
    { href: '/crew/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <main className="space-y-6 p-4 text-on-bg-readable">
      <div>
        <h1 className="font-display text-lg font-bold">CREW DASHBOARD</h1>
        {assignment && (
          <p className="mt-2 rounded border-2 border-border bg-bg-secondary px-3 py-2 font-body text-sm font-semibold text-text-on-surface">
            Posted: {assignment.assignment_label}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="font-display text-[9px] text-text-secondary">TEAMS</p>
          <p className="font-display text-2xl text-accent-blue">{teamCount ?? 0}</p>
        </Card>
        <Card>
          <p className="font-display text-[9px] text-text-secondary">PARTICIPANTS</p>
          <p className="font-display text-2xl text-accent-green">{memberCount ?? 0}</p>
        </Card>
        <Card>
          <p className="font-display text-[9px] text-text-secondary">PENDING</p>
          <p className="font-display text-2xl text-accent-yellow">{pendingCount ?? 0}</p>
        </Card>
        <Card>
          <p className="font-display text-[9px] text-text-secondary">POINTS GIVEN</p>
          <p className="font-display text-2xl text-accent-green">{totalPoints}</p>
        </Card>
      </div>
      <div className="grid gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Button variant="outline" className="w-full">
              {l.label}
            </Button>
          </Link>
        ))}
      </div>
    </main>
  );
}
