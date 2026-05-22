import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { getContentRouteId } from '@/lib/content';
import type { CaseStudyContent, InnovationCardContent } from '@/lib/content-types';

const COMPANY_ACCENT: Record<string, string> = {
  Tesla: 'border-accent-red/50',
  Netflix: 'border-accent-red/40',
  OpenAI: 'border-accent-green/50',
  Uniqlo: 'border-accent-blue/40',
  RON88: 'border-accent-yellow/50',
};

export function ContentCompanyCard({
  item,
  subtitle,
}: {
  item: CaseStudyContent | InnovationCardContent;
  subtitle: string;
}) {
  const href = `/learn/${getContentRouteId(item.type, item.slug)}`;
  const accent = COMPANY_ACCENT[item.company] ?? 'border-border';

  return (
    <Link href={href}>
      <div className={`win98-dialog btn-press ${accent}`}>
        <div className="win98-titlebar">
          <span>{item.company}</span>
          <span>→</span>
        </div>
        <Card className="border-0 rounded-none space-y-1">
          <p className="font-display text-xs">{subtitle}</p>
          <p className="font-body text-[10px] text-text-secondary">Tap to open full material</p>
        </Card>
      </div>
    </Link>
  );
}
