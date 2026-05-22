import { requireAdmin } from '@/lib/auth';

export default async function CrewTeamsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return children;
}
