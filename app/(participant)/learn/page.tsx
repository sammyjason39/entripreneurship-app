import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';

export default async function LearnPage() {
  const supabase = await createClient();
  const { data: items } = await supabase.from('content').select('*').order('sort_order');

  const caseStudies = items?.filter((i) => i.type === 'case_study') ?? [];
  const innovation = items?.filter((i) => i.type === 'innovation_card') ?? [];

  return (
    <main className="p-4 space-y-6">
      <h1 className="font-display text-lg">LEARN</h1>
      <section>
        <p className="font-display text-[10px] text-text-secondary mb-3">CASE STUDIES</p>
        <div className="space-y-3">
          {caseStudies.map((c) => (
            <Link key={c.id} href={`/learn/${c.id}`}>
              <div className="win98-dialog btn-press">
                <div className="win98-titlebar">
                  <span>{c.company}</span>
                  <span>×</span>
                </div>
                <Card className="border-0 rounded-none">
                  <p className="font-display text-xs">{c.title}</p>
                </Card>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <p className="font-display text-[10px] text-text-secondary mb-3">INNOVATION CARDS</p>
        <div className="space-y-3">
          {innovation.map((c) => (
            <Link key={c.id} href={`/learn/${c.id}`}>
              <div className="win98-dialog btn-press">
                <div className="win98-titlebar">
                  <span>{c.company}</span>
                  <span>×</span>
                </div>
                <Card className="border-0 rounded-none">
                  <p className="font-display text-xs">{c.title}</p>
                </Card>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
