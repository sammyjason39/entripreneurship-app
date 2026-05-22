import { requireAdmin } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <div className="mx-auto min-h-dvh w-full max-w-6xl">
      <AdminNav />
      <div className="border-b border-border/40 px-4 pb-2 text-on-bg-readable">
        <p className="font-body text-xs text-text-on-bg-muted">
          Signed in as <span className="font-semibold">{profile.full_name}</span> (super admin)
        </p>
      </div>
      <div className="pb-10 pt-4">{children}</div>
    </div>
  );
}
