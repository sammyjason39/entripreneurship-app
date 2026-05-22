import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { listAdminCrewMembers } from '@/lib/admin-crew';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { teamNameFromJoin } from '@/lib/supabase-helpers';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: teamCount },
    { count: memberCount },
    { count: pendingCount },
    { data: txSum },
    { data: recentPending },
    crewMembers,
  ] = await Promise.all([
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('team_members').select('*', { count: 'exact', head: true }),
    supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('transactions').select('amount').eq('type', 'reward'),
    supabase
      .from('submissions')
      .select('id, submitted_at, status, teams(name), stations(number, name)')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })
      .limit(8),
    listAdminCrewMembers(),
  ]);

  const totalPoints = txSum?.reduce((a, t) => a + t.amount, 0) ?? 0;
  const onDuty = crewMembers.filter((m) => m.app_role === 'crew').length;

  return (
    <main className="space-y-6 px-4 text-on-bg-readable">
      <div>
        <h1 className="font-display text-2xl font-bold">Jury dashboard</h1>
        <p className="mt-1 font-body text-sm font-semibold text-text-on-bg-muted">
          Event control center — review submissions, manage crew, monitor teams.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <p className="font-display text-[9px] text-text-secondary">TEAMS</p>
          <p className="font-display text-2xl font-bold text-accent-blue">{teamCount ?? 0}</p>
        </Card>
        <Card>
          <p className="font-display text-[9px] text-text-secondary">PARTICIPANTS</p>
          <p className="font-display text-2xl font-bold text-accent-green">{memberCount ?? 0}</p>
        </Card>
        <Card>
          <p className="font-display text-[9px] text-text-secondary">PENDING REVIEW</p>
          <p className="font-display text-2xl font-bold text-accent-yellow">{pendingCount ?? 0}</p>
        </Card>
        <Card>
          <p className="font-display text-[9px] text-text-secondary">CREW ON ROSTER</p>
          <p className="font-display text-2xl font-bold text-accent-green">{onDuty}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="font-display text-[10px] font-bold text-text-secondary">POINTS DISTRIBUTED</p>
          <p className="font-display text-3xl font-bold text-accent-green">{totalPoints}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/crew/submissions">
              <Button size="sm">Review submissions</Button>
            </Link>
            <Link href="/admin/crew">
              <Button size="sm" variant="outline">
                Manage crew
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <p className="mb-3 font-display text-[10px] font-bold text-text-secondary">
            CREW ASSIGNMENTS
          </p>
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {crewMembers
              .filter((m) => m.app_role === 'crew')
              .map((m) => (
                <li key={m.id} className="border-b border-border/30 pb-2 font-body text-sm last:border-0">
                  <span className="font-semibold">{m.full_name}</span>
                  <span className="block text-xs text-text-secondary">
                    {m.assignment?.assignment_label ?? 'Unassigned'}
                  </span>
                </li>
              ))}
            {onDuty === 0 && (
              <li className="text-sm text-text-secondary">No crew accounts yet.</li>
            )}
          </ul>
          <Link href="/admin/crew" className="mt-3 inline-block font-display text-xs text-accent-green underline">
            Assign crew →
          </Link>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold">Pending submissions</h2>
          <Link href="/crew/submissions" className="font-display text-[10px] text-link-on-bg underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {recentPending?.map((s) => (
            <Card key={s.id}>
              <p className="font-display text-xs font-bold">
                {teamNameFromJoin(s.teams)}
              </p>
              <p className="text-[10px] text-text-secondary">
                Pos{' '}
                {(Array.isArray(s.stations)
                  ? (s.stations[0] as { number?: number })?.number
                  : (s.stations as { number?: number })?.number) ?? '?'}{' '}
                —{' '}
                {(Array.isArray(s.stations)
                  ? (s.stations[0] as { name?: string })?.name
                  : (s.stations as { name?: string })?.name) ?? 'Station'}
              </p>
            </Card>
          ))}
          {(!recentPending || recentPending.length === 0) && (
            <Card>
              <p className="font-body text-sm text-text-on-surface">No pending submissions.</p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
