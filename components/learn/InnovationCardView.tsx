import Link from 'next/link';
import type { InnovationCardContent } from '@/lib/content-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getContentRouteId } from '@/lib/content';

export function InnovationCardView({ item }: { item: InnovationCardContent }) {
  const caseHref = `/learn/${getContentRouteId('case_study', item.slug)}`;

  return (
    <div className="space-y-4">
      <Card className="border-accent-blue/50 bg-accent-blue/5">
        <p className="font-display text-[10px] text-accent-blue">INNOVATION CARD — POS 3 · IDEATE</p>
        <p className="font-body text-sm text-text-on-surface mt-1">
          Study each innovation below with your team, then brainstorm your top 3 ideas for the station
          submission.
        </p>
      </Card>

      {item.sections.map((section, i) => (
        <div key={section.title} className="win98-dialog">
          <div className="win98-titlebar">
            <span>
              {i + 1}. {section.title}
            </span>
            <span>♦</span>
          </div>
          <Card className="border-0 rounded-none">
            <p className="font-body text-sm text-text-on-surface whitespace-pre-wrap leading-relaxed">
              {section.body}
            </p>
          </Card>
        </div>
      ))}

      <Link href={caseHref}>
        <Button variant="outline" className="w-full text-xs">
          View {item.company} case study (Pos 1)
        </Button>
      </Link>
    </div>
  );
}
