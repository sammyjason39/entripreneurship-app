import Link from 'next/link';
import { CASE_STUDIES, INNOVATION_CARDS } from '@/lib/event-content';
import { ContentCompanyCard } from '@/components/learn/ContentCompanyCard';
import { Card } from '@/components/ui/card';

export default function LearnPage() {
  return (
    <main className="space-y-6 p-4">
      <div>
        <h1 className="font-display text-lg">LEARN</h1>
        <p className="mt-1 font-body text-sm text-text-on-bg-muted">
          Official EnTripreneurship Vol. 2 materials from your event booklet.
        </p>
      </div>

      <Card className="space-y-2 border-accent-yellow/40">
        <p className="font-display text-[10px] text-accent-yellow">POS 1 — EMPATHIZE</p>
        <p className="font-body text-xs text-text-secondary">
          Case studies: company profile + competitor context + discussion question.
        </p>
      </Card>

      <section className="space-y-3">
        <p className="font-display text-[10px] text-text-secondary">CASE STUDIES (5)</p>
        {CASE_STUDIES.map((c) => (
          <ContentCompanyCard key={c.slug} item={c} subtitle="Case study" />
        ))}
      </section>

      <Card className="space-y-2 border-accent-blue/40">
        <p className="font-display text-[10px] text-accent-blue">POS 3 — IDEATE</p>
        <p className="font-body text-xs text-text-secondary">
          Innovation cards: key innovations to inspire your team&apos;s top 3 ideas.
        </p>
      </Card>

      <section className="space-y-3">
        <p className="font-display text-[10px] text-text-secondary">INNOVATION CARDS (5)</p>
        {INNOVATION_CARDS.map((c) => (
          <ContentCompanyCard key={c.slug} item={c} subtitle="Innovation card" />
        ))}
      </section>

      <Link
        href="/missions"
        className="block text-center font-display text-[10px] text-accent-green underline"
      >
        Back to missions
      </Link>
    </main>
  );
}
