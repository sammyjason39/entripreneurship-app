import Link from 'next/link';
import { CASE_STUDIES, INNOVATION_CARDS } from '@/lib/event-content';
import { ContentCompanyCard } from '@/components/learn/ContentCompanyCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Props = {
  stationNumber: 1 | 3;
};

export function StationMaterialsPanel({ stationNumber }: Props) {
  if (stationNumber === 1) {
    return (
      <section className="space-y-3">
        <Card className="border-accent-yellow/50 space-y-2">
          <p className="font-display text-xs text-accent-yellow">CASE STUDY MATERIALS</p>
          <p className="font-body text-sm text-text-secondary">
            Choose one company with your team. Read the profile and case study, then answer the
            question in your Pos 1 submission.
          </p>
          <Link href="/learn">
            <Button variant="outline" className="w-full text-xs">
              Open all case studies
            </Button>
          </Link>
        </Card>
        <div className="space-y-3">
          {CASE_STUDIES.map((item) => (
            <ContentCompanyCard key={item.slug} item={item} subtitle="Case study · Empathize" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <Card className="border-accent-blue/50 space-y-2">
        <p className="font-display text-xs text-accent-blue">INNOVATION CARDS</p>
        <p className="font-body text-sm text-text-secondary">
          Use the same company you studied at Pos 1 (or pick one now). Review every innovation
          section before ideating.
        </p>
        <Link href="/learn">
          <Button variant="outline" className="w-full text-xs">
            Open all innovation cards
          </Button>
        </Link>
      </Card>
      <div className="space-y-3">
        {INNOVATION_CARDS.map((item) => (
          <ContentCompanyCard key={item.slug} item={item} subtitle="Innovation card · Ideate" />
        ))}
      </div>
    </section>
  );
}
