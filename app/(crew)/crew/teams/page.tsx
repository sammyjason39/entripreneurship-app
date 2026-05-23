import { listTeamsOverview } from '@/lib/teams-overview';
import { TeamsOverviewTable } from '@/components/admin/TeamsOverviewTable';

export default async function CrewTeamsPage() {
  const overview = await listTeamsOverview();

  return (
    <main className="space-y-4 p-4">
      <h1 className="font-display text-lg">TEAMS</h1>
      <p className="font-body text-xs text-text-secondary">
        Trek case study & timer per tim — {overview.length} tim terdaftar
      </p>
      <TeamsOverviewTable rows={overview} detailHrefPrefix="/crew/teams" />
    </main>
  );
}
