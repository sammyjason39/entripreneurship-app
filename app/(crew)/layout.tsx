import Link from 'next/link';
import { requireCrew } from '@/lib/auth';
import { CrewBottomNav } from '@/components/app/CrewBottomNav';
import { Button } from '@/components/ui/button';

export default async function CrewLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireCrew();

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px]">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b-2 border-border bg-bg-primary px-4 py-3 text-on-bg-readable">
        <div>
          <span className="rounded border border-border bg-bg-secondary px-2 py-0.5 font-display text-[9px] font-bold text-text-on-surface">
            {profile.app_role === 'admin' ? 'ADMIN' : 'CREW'}
          </span>
          <p className="font-display text-sm font-bold">{profile.full_name}</p>
        </div>
        <Link href={profile.app_role === 'admin' ? '/admin' : '/crew'}>
          <Button size="sm" variant="outline">
            {profile.app_role === 'admin' ? 'JURY' : 'HOME'}
          </Button>
        </Link>
      </header>
      <div className="pb-24 pt-2">{children}</div>
      <CrewBottomNav />
    </div>
  );
}
