import {
  getRegistrationStats,
  listEventRegistrations,
} from '@/lib/admin-registrations';
import { AdminParticipantsSection } from '@/components/admin/AdminParticipantsSection';
import { Card } from '@/components/ui/card';

export default async function AdminParticipantsPage() {
  const [stats, registrations] = await Promise.all([
    getRegistrationStats(),
    listEventRegistrations(),
  ]);

  return (
    <main className="space-y-6 px-4 text-on-bg-readable">
      <div>
        <h1 className="font-display text-xl font-bold">Participants</h1>
        <p className="mt-1 font-body text-sm font-semibold text-text-on-bg-muted">
          People who registered on the event form — they log in with WhatsApp on the app.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card>
          <p className="font-display text-[9px] text-text-secondary">REGISTERED</p>
          <p className="font-display text-2xl font-bold text-accent-blue">{stats.total}</p>
        </Card>
        <Card>
          <p className="font-display text-[9px] text-text-secondary">LOGGED IN VIA APP</p>
          <p className="font-display text-2xl font-bold text-accent-green">{stats.linked}</p>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <p className="font-display text-[9px] text-text-secondary">NOT YET IN APP</p>
          <p className="font-display text-2xl font-bold text-accent-yellow">
            {stats.total - stats.linked}
          </p>
        </Card>
      </div>

      <AdminParticipantsSection initial={registrations} />
    </main>
  );
}
