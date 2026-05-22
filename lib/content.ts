import {
  CASE_STUDIES,
  INNOVATION_CARDS,
  getCaseStudy,
  getInnovationCard,
} from '@/lib/event-content';
import type { CompanySlug } from '@/lib/content-types';
import type { ContentType } from '@/lib/types';

export function isCompanySlug(value: string): value is CompanySlug {
  return ['tesla', 'netflix', 'openai', 'uniqlo', 'ron88'].includes(value);
}

export function listContentByType(type: ContentType) {
  return type === 'case_study' ? CASE_STUDIES : INNOVATION_CARDS;
}

export function getContentRouteId(type: ContentType, slug: CompanySlug): string {
  return `${type}:${slug}`;
}

export function parseContentRouteId(id: string): { type: ContentType; slug: CompanySlug } | null {
  const [type, slug] = id.split(':');
  if ((type !== 'case_study' && type !== 'innovation_card') || !isCompanySlug(slug)) {
    return null;
  }
  return { type, slug };
}

export function resolveContent(id: string) {
  const parsed = parseContentRouteId(id);
  if (!parsed) return null;
  if (parsed.type === 'case_study') return getCaseStudy(parsed.slug) ?? null;
  return getInnovationCard(parsed.slug) ?? null;
}
