import { createServiceClient } from '@/lib/supabase/server';
import { listTeamsOverview } from '@/lib/teams-overview';
import { AdminTeamFunds } from '@/components/admin/AdminTeamFunds';
import { TeamsOverviewTable } from '@/components/admin/TeamsOverviewTable';

export default async function AdminTeamsPage() {
  const [overview, service] = await Promise.all([
    listTeamsOverview(),
    createServiceClient(),
  ]);
  const { data: teams } = await service
    .from('teams')
    .select('id, name, balance')
    .order('name', { ascending: true });

  return (
    <main className="space-y-8 px-4 text-on-bg-readable">
      <div>
        <h1 className="font-display text-xl font-bold">Teams</h1>
        <p className="mt-1 font-body text-sm text-text-on-bg-muted">
          Trek case study, timer, anggota, dan saldo EnCoins.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold">Semua tim ({overview.length})</h2>
        <TeamsOverviewTable rows={overview} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold">Team funds</h2>
        <AdminTeamFunds teams={teams ?? []} />
      </section>
    </main>
  );
}
