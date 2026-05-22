import { requireAdmin } from '@/lib/auth';

export default async function CrewSubmissionsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return children;
}
