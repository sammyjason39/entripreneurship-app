import { notFound } from 'next/navigation';
import { getAllDocSlugs, getDocHtml } from '@/lib/docs';
import { DocsArticle } from '@/components/docs/DocsArticle';

export function generateStaticParams() {
  return getAllDocSlugs()
    .filter((slug) => slug !== 'index')
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDocHtml(slug);
  if (!doc) return { title: 'Documentation' };
  return {
    title: `${doc.entry.title} — EnTripreneurship Docs`,
    description: doc.entry.description,
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDocHtml(slug);
  if (!doc) notFound();

  return (
    <div className="space-y-4">
      <DocsArticle html={doc.html} />
    </div>
  );
}
