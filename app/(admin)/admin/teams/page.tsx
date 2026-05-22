import { createServiceClient } from '@/lib/supabase/server';
import { AdminTeamFunds } from '@/components/admin/AdminTeamFunds';

export default async function AdminTeamsFundPage() {
  const service = await createServiceClient();
  const { data: teams } = await service
    .from('teams')
    .select('id, name, balance')
    .order('name', { ascending: true });

  return (
    <main className="space-y-6 px-4 text-on-bg-readable">
      <div>
        <h1 className="font-display text-xl font-bold">Team funds</h1>
        <p className="mt-1 font-body text-sm text-text-on-bg-muted">
          Add or deduct EnCoins for any team — no crew PIN required.
        </p>
      </div>
      <AdminTeamFunds teams={teams ?? []} />
    </main>
  );
}
