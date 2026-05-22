import { createClient } from '@/lib/supabase/server';
import { listAdminCrewMembers } from '@/lib/admin-crew';
import { CrewCreateForm } from '@/components/admin/CrewCreateForm';
import { CrewRoster } from '@/components/admin/CrewRoster';
import type { Station } from '@/lib/types';

export default async function AdminCrewPage() {
  const supabase = await createClient();
  const { data: stations } = await supabase.from('stations').select('*').order('number');
  const members = await listAdminCrewMembers();

  return (
    <main className="space-y-6 px-4 text-on-bg-readable">
      <div>
        <h1 className="font-display text-xl font-bold">Crew & jury accounts</h1>
        <p className="mt-1 font-body text-sm font-semibold text-text-on-bg-muted">
          Create logins, set passwords, and assign each person to a station or jury role.
        </p>
      </div>

      <CrewCreateForm stations={(stations ?? []) as Station[]} />
      <CrewRoster members={members} stations={(stations ?? []) as Station[]} />
    </main>
  );
}
