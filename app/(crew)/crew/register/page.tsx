import { redirect } from 'next/navigation';
import { requireCrewMember } from '@/lib/auth';
import { getCrewAssignment } from '@/lib/crew-assignment';
import { getCrewPermissions } from '@/lib/crew-permissions';
import { CrewRegisterForm } from '@/components/crew/CrewRegisterForm';

export default async function CrewRegisterPage() {
  const { user, profile } = await requireCrewMember();
  const assignment = await getCrewAssignment(user.id);
  const permissions = getCrewPermissions(profile, assignment);

  if (!permissions.canRegisterParticipants) {
    redirect('/crew');
  }

  return (
    <main className="space-y-4 p-4 text-on-bg-readable">
      <div>
        <h1 className="font-display text-lg font-bold">Register participant</h1>
        <p className="mt-1 font-body text-sm text-text-on-bg-muted">
          Add someone who signed up on the event site so they can log in with WhatsApp.
        </p>
      </div>
      <CrewRegisterForm />
    </main>
  );
}
