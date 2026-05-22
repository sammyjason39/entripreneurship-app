import Link from 'next/link';
import { requireCrewOrAdmin } from '@/lib/auth';
import { TeamTrackingBoard } from '@/components/crew/TeamTrackingBoard';

export default async function CrewTrackingPage() {
  await requireCrewOrAdmin();

  return (
    <main className="space-y-4 p-4 text-on-bg-readable">
      <Link href="/crew" className="font-display text-xs text-accent-green">
        ← CREW
      </Link>
      <h1 className="font-display text-lg">TEAM MOVEMENT</h1>
      <p className="font-body text-xs text-text-on-bg-muted">
        Live view from station QR check-ins — who is where, and when they left the last post.
      </p>
      <TeamTrackingBoard />
    </main>
  );
}
