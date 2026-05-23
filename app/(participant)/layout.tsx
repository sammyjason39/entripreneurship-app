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
    <div className="mx-auto min-h-dvh w-full max-w-[480px]">
      <LocationTracker enabled={profile.onboarding_complete} />
      <TopBar
        teamName={teamData?.team.name}
        balance={teamData?.team.balance}
        raceStartedAt={teamData?.team.race_started_at}
        raceFinishedAt={teamData?.team.race_finished_at}
      />
      <div className="pb-24 pt-2">{children}</div>
      <BottomNav />
    </div>
  );
}
