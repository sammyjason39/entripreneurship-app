import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveContent } from '@/lib/content';
import { isCaseStudy } from '@/lib/content-types';
import { CaseStudyView } from '@/components/learn/CaseStudyView';
import { InnovationCardView } from '@/components/learn/InnovationCardView';

export default async function LearnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = resolveContent(decodeURIComponent(id));
  if (!item) notFound();

  const stationLabel = item.stationNumber === 1 ? 'Pos 1 · Empathize' : 'Pos 3 · Ideate';
  const typeLabel = isCaseStudy(item) ? 'Case Study' : 'Innovation Card';

  return (
    <main className="space-y-4 p-4">
      <Link
        href="/learn"
        className="font-display text-[10px] text-accent-green underline"
      >
        ← All materials
      </Link>

      <div>
        <p className="font-display text-[10px] text-text-secondary">
          {typeLabel} · {stationLabel}
        </p>
        <h1 className="font-display text-lg">{item.company}</h1>
      </div>

      {isCaseStudy(item) ? <CaseStudyView item={item} /> : <InnovationCardView item={item} />}
    </main>
  );
}
