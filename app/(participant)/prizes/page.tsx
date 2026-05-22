import { Card } from '@/components/ui/card';
import { SponsorRow } from '@/components/app/SponsorRow';
import { Trophy } from 'lucide-react';

const categories = [
  { title: 'The Richest', desc: 'Highest EnCoin balance at event end' },
  { title: 'The Fastest', desc: 'First team to complete all 7 stations' },
  { title: 'The Most Innovative', desc: 'Jury vote — boldest solution' },
  { title: 'Best Outfit', desc: 'Best team outfit of the day' },
];

export default function PrizesPage() {
  return (
    <main className="p-4 space-y-6">
      <h1 className="font-display text-lg">PRIZES</h1>
      <Card className="border-accent-yellow/50 text-center">
        <p className="font-display text-accent-yellow">PRIZES WORTH IDR 3M+</p>
      </Card>
      <div className="space-y-4">
        {categories.map((c) => (
          <Card key={c.title} className="flex gap-3 items-start">
            <Trophy className="text-accent-yellow shrink-0" size={28} />
            <div>
              <p className="font-display text-xs">{c.title}</p>
              <p className="font-body text-xs text-text-secondary mt-1">{c.desc}</p>
            </div>
          </Card>
        ))}
      </div>
      <SponsorRow label="Sponsors" />
    </main>
  );
}
