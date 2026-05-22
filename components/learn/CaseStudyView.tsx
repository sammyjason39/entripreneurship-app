import Link from 'next/link';
import type { CaseStudyContent } from '@/lib/content-types';
import { ContentProfileFields } from '@/components/learn/ContentProfileFields';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getContentRouteId } from '@/lib/content';

export function CaseStudyView({ item }: { item: CaseStudyContent }) {
  const innovationHref = `/learn/${getContentRouteId('innovation_card', item.slug)}`;

  return (
    <div className="space-y-4">
      <div className="win98-dialog">
        <div className="win98-titlebar">
          <span>{item.company} — Company profile</span>
          <span>□</span>
        </div>
        <Card className="border-0 rounded-none">
          <ContentProfileFields profile={item.profile} />
        </Card>
      </div>

      <div className="win98-dialog">
        <div className="win98-titlebar bg-accent-yellow/20">
          <span>Case study — Pos 1 · Empathize</span>
          <span>!</span>
        </div>
        <Card className="border-0 rounded-none space-y-3">
          <h2 className="font-display text-sm text-accent-yellow">{item.caseStudy.title}</h2>
          <p className="font-body text-sm text-text-on-surface whitespace-pre-wrap leading-relaxed">
            {item.caseStudy.body}
          </p>
        </Card>
      </div>

      <Card className="border-2 border-accent-green/60 bg-accent-green/5 space-y-2">
        <p className="font-display text-[10px] text-accent-green">YOUR TASK AT POS 1</p>
        <p className="font-body text-sm font-semibold text-text-on-surface leading-relaxed">
          {item.caseStudy.question}
        </p>
      </Card>

      <Link href={innovationHref}>
        <Button variant="outline" className="w-full text-xs">
          Preview {item.company} innovation card (Pos 3)
        </Button>
      </Link>
    </div>
  );
}
