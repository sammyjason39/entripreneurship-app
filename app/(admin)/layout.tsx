import { requireAdmin } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="mx-auto min-h-dvh w-full max-w-6xl">
      <AdminNav />
      <div className="pb-10 pt-4">{children}</div>
    </div>
  );
}
