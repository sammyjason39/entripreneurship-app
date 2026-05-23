import Link from 'next/link';
import { requireCrewOrAdmin } from '@/lib/auth';

/** Submissions, leaderboard, teams, map, tracking — crew and admin */
export default async function CrewJuryLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireCrewOrAdmin();
  const backHref = profile.app_role === 'admin' ? '/admin' : '/crew';
  const backLabel = profile.app_role === 'admin' ? '← Admin dashboard' : '← Crew home';

  return (
    <div className="space-y-3">
      <Link href={backHref} className="mx-4 mt-2 inline-block font-display text-xs text-accent-green">
        {backLabel}
      </Link>
      {children}
    </div>
  );
}
