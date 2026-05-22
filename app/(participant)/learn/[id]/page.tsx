import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { notFound } from 'next/navigation';

export default async function LearnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from('content').select('*').eq('id', id).single();
  if (!item) notFound();

  return (
    <main className="p-4">
      <div className="win98-dialog">
        <div className="win98-titlebar">
          <span>{item.company}</span>
          <span>×</span>
        </div>
        <Card className="border-0 rounded-none space-y-3">
          <h1 className="font-display text-sm">{item.title}</h1>
          <p className="font-body text-sm text-text-secondary whitespace-pre-wrap">{item.body}</p>
        </Card>
      </div>
    </main>
  );
}
