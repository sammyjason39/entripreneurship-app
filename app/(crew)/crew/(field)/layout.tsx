import { requireCrewMember } from '@/lib/auth';

/** Pay, scan, station, register — crew only (admins use /admin) */
export default async function CrewFieldLayout({ children }: { children: React.ReactNode }) {
  await requireCrewMember();
  return <>{children}</>;
}
