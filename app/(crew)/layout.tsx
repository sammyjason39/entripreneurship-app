import { requireCrewMember } from '@/lib/auth';
import { getCrewAssignment } from '@/lib/crew-assignment';
import { getCrewPermissions } from '@/lib/crew-permissions';
import { CrewBottomNav } from '@/components/app/CrewBottomNav';
import { LogoutButton } from '@/components/app/LogoutButton';

export default async function CrewLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireCrewMember();
  const assignment = await getCrewAssignment(user.id);
  const permissions = getCrewPermissions(profile, assignment);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b-2 border-border bg-bg-primary px-4 py-3 text-on-bg-readable">
        <div>
          <span className="rounded border border-border bg-bg-secondary px-2 py-0.5 font-display text-[9px] font-bold text-text-on-surface">
            CREW
          </span>
          <p className="font-display text-sm font-bold">{profile.full_name}</p>
          {permissions.assignmentLabel && (
            <p className="font-body text-[10px] text-text-on-bg-muted">{permissions.assignmentLabel}</p>
          )}
        </div>
        <LogoutButton />
      </header>
      <div className="pb-24 pt-2">{children}</div>
      <CrewBottomNav permissions={permissions} />
    </div>
  );
}
