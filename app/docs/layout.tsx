import Link from 'next/link';
import { DOC_ENTRIES } from '@/lib/docs-manifest';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const metadata = {
  title: 'Documentation — EnTripreneurship Vol. 02',
  description: 'Guides for participants, crew, and admin',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg-primary text-on-bg-readable">
      <header className="border-b-2 border-border bg-bg-primary px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="font-display text-xs text-accent-green underline">
              ← App
            </Link>
            <Link href="/auth/login" className="font-display text-xs text-text-on-bg-muted underline">
              Login
            </Link>
            <h1 className="font-display text-sm font-bold">DOCUMENTATION</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <DocsSidebar entries={DOC_ENTRIES} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
