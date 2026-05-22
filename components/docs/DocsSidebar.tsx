'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { DocEntry, DocGroup } from '@/lib/docs-manifest';
import { getDocGroupLabel } from '@/lib/docs-manifest';

const GROUP_ORDER: DocGroup[] = ['start', 'guides', 'technical'];

function docHref(slug: string) {
  return slug === 'index' ? '/docs' : `/docs/${slug}`;
}

export function DocsSidebar({ entries }: { entries: DocEntry[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6" aria-label="Documentation">
      {GROUP_ORDER.map((group) => {
        const items = entries.filter((e) => e.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group}>
            <p className="font-display text-[9px] uppercase tracking-wider text-text-on-bg-muted">
              {getDocGroupLabel(group)}
            </p>
            <ul className="mt-2 space-y-1">
              {items.map((doc) => {
                const href = docHref(doc.slug);
                const active = pathname === href || (pathname === '/docs' && doc.slug === 'index');
                return (
                  <li key={doc.slug}>
                    <Link
                      href={href}
                      className={cn(
                        'block rounded border px-2 py-1.5 font-body text-sm transition-colors',
                        active
                          ? 'border-accent-green bg-bg-secondary font-semibold text-text-on-surface'
                          : 'border-transparent text-text-on-bg hover:border-border hover:bg-bg-secondary/80'
                      )}
                    >
                      {doc.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
