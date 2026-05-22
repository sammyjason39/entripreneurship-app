import Link from 'next/link';
import { requireCrewMember } from '@/lib/auth';
import { getCrewAssignment } from '@/lib/crew-assignment';
import { getCrewPermissions } from '@/lib/crew-permissions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function CrewHomePage() {
  const { user, profile } = await requireCrewMember();
  const assignment = await getCrewAssignment(user.id);
  const permissions = getCrewPermissions(profile, assignment);

  const links = [
    { href: '/crew/station', label: 'Station QR & check-out', show: true },
    { href: '/crew/tracking', label: 'Team movement tracker', show: true },
    { href: '/crew/pay', label: 'EnCoins — add / deduct', show: permissions.canPay },
    { href: '/crew/map', label: 'Team locations (live map)', show: permissions.canViewMap },
    { href: '/crew/leaderboard', label: 'Live leaderboard', show: permissions.canViewLeaderboard },
    {
      href: '/crew/register',
      label: 'Register participant (form list)',
      show: permissions.canRegisterParticipants,
    },
  ].filter((l) => l.show);

  return (
    <main className="space-y-6 p-4 text-on-bg-readable">
      <div>
        <h1 className="font-display text-lg font-bold">Crew</h1>
        <p className="mt-1 font-body text-sm text-text-on-bg-muted">
          Field tools for the event — not the jury admin console.
        </p>
      </div>

      {permissions.assignmentLabel && (
        <Card>
          <p className="font-display text-[10px] text-text-secondary">YOUR POST</p>
          <p className="font-body text-sm font-semibold text-text-on-surface">
            {permissions.assignmentLabel}
          </p>
        </Card>
      )}

      <div className="grid gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            <Button variant="outline" className="w-full">
              {l.label}
            </Button>
          </Link>
        ))}
      </div>

      {!permissions.canRegisterParticipants && (
        <p className="font-body text-xs text-text-on-bg-muted">
          Participant registration is only on the registration desk account.
        </p>
      )}
    </main>
  );
}
