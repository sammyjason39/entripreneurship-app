import { CASE_STUDIES } from '@/lib/event-content';
import type { CompanySlug } from '@/lib/content-types';

export const EVENT_BOOKLET_PDF = '/materials/case-study-and-innovation-card.pdf';

export const COMPANY_TRACK_SLUGS: CompanySlug[] = [
  'tesla',
  'netflix',
  'openai',
  'uniqlo',
  'ron88',
];

export const EVENT_TRACKS = CASE_STUDIES.map((c) => ({
  slug: c.slug,
  company: c.company,
  headline: c.caseStudy.title,
  questionPreview:
    c.caseStudy.question.length > 120
      ? `${c.caseStudy.question.slice(0, 120)}…`
      : c.caseStudy.question,
}));

export function trackLabel(slug: CompanySlug | string | null | undefined): string {
  if (!slug) return '';
  return EVENT_TRACKS.find((t) => t.slug === slug)?.company ?? slug;
}

export function isCompanySlug(value: string): value is CompanySlug {
  return COMPANY_TRACK_SLUGS.includes(value as CompanySlug);
}
