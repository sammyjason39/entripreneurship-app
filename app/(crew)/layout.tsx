import Link from 'next/link';
import { requireCrew } from '@/lib/auth';
import { CrewBottomNav } from '@/components/app/CrewBottomNav';
import { Button } from '@/components/ui/button';

export default async function CrewLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireCrew();

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-bg-primary px-4 py-3">
        <div>
          <span className="rounded bg-accent-blue/20 px-2 py-0.5 font-display text-[9px] text-accent-blue">
            CREW
          </span>
          <p className="font-display text-sm">{profile.full_name}</p>
        </div>
        <Link href="/crew">
          <Button size="sm" variant="outline">
            HOME
          </Button>
        </Link>
      </header>
      <div className="pb-24 pt-2">{children}</div>
      <CrewBottomNav />
    </>
  );
}
