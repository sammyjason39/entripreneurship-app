import Link from 'next/link';
import { requireCrewOrAdmin } from '@/lib/auth';
import { TeamTrackingBoard } from '@/components/crew/TeamTrackingBoard';

export default async function CrewTrackingPage() {
  const { profile } = await requireCrewOrAdmin();
  const backHref = profile.app_role === 'admin' ? '/admin' : '/crew';
  const backLabel = profile.app_role === 'admin' ? '← ADMIN' : '← CREW';

  return (
    <main className="space-y-4 p-4 text-on-bg-readable">
      <Link href={backHref} className="font-display text-xs text-accent-green">
        {backLabel}
      </Link>
      <h1 className="font-display text-lg">TEAM MOVEMENT</h1>
      <p className="font-body text-xs text-text-on-bg-muted">
        Live view from station QR check-ins — who is where, and when they left the last post.
      </p>
      <TeamTrackingBoard />
    </main>
  );
}
