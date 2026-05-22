import { requireParticipant } from '@/lib/auth';
import { getTeamForUser } from '@/lib/team';
import { TopBar } from '@/components/app/TopBar';
import { BottomNav } from '@/components/app/BottomNav';
import { LocationTracker } from '@/components/app/LocationTracker';

export default async function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireParticipant();
  const teamData = await getTeamForUser(user.id);

  return (
    <>
      <LocationTracker enabled={profile.onboarding_complete} />
      <TopBar teamName={teamData?.team.name} balance={teamData?.team.balance} />
      <div className="pb-24 pt-2">{children}</div>
      <BottomNav />
    </>
  );
}
