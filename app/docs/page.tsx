import { notFound } from 'next/navigation';
import { getDocHtml } from '@/lib/docs';
import { DocsArticle } from '@/components/docs/DocsArticle';

export default function DocsIndexPage() {
  const doc = getDocHtml('index');
  if (!doc) notFound();

  return (
    <div className="space-y-4">
      <DocsArticle html={doc.html} />
    </div>
  );
}
