import type { CaseStudyContent } from '@/lib/content-types';

export function ContentProfileFields({ profile }: { profile: CaseStudyContent['profile'] }) {
  const rows: { label: string; value?: string }[] = [
    { label: 'Year established', value: profile.yearEstablished },
    { label: 'Founders', value: profile.founders },
    { label: 'CEO', value: profile.ceo },
    { label: 'Headquarters', value: profile.headquarters },
  ].filter((r) => r.value);

  return (
    <dl className="space-y-2 font-body text-sm">
      {rows.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-[minmax(0,38%)_1fr] gap-2 border-b border-border/40 pb-2 last:border-0">
          <dt className="font-display text-[10px] uppercase text-text-secondary">{label}</dt>
          <dd className="text-text-on-surface">{value}</dd>
        </div>
      ))}
      <div className="pt-1">
        <dt className="font-display text-[10px] uppercase text-text-secondary mb-1">Business description</dt>
        <dd className="text-text-on-surface whitespace-pre-wrap leading-relaxed">{profile.businessDescription}</dd>
      </div>
    </dl>
  );
}
