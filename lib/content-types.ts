import type { ContentType } from '@/lib/types';

export type CompanySlug = 'tesla' | 'netflix' | 'openai' | 'uniqlo' | 'ron88';

export type ContentSection = {
  title: string;
  body: string;
};

export type CaseStudyContent = {
  slug: CompanySlug;
  company: string;
  type: 'case_study';
  stationNumber: 1;
  sortOrder: number;
  profile: {
    yearEstablished?: string;
    founders?: string;
    ceo?: string;
    headquarters: string;
    businessDescription: string;
  };
  caseStudy: {
    title: string;
    body: string;
    question: string;
  };
};

export type InnovationCardContent = {
  slug: CompanySlug;
  company: string;
  type: 'innovation_card';
  stationNumber: 3;
  sortOrder: number;
  sections: ContentSection[];
};

export type EventContentItem = CaseStudyContent | InnovationCardContent;

export function isCaseStudy(item: EventContentItem): item is CaseStudyContent {
  return item.type === 'case_study';
}

export function isInnovationCard(item: EventContentItem): item is InnovationCardContent {
  return item.type === 'innovation_card';
}

export type ContentListFilter = {
  type?: ContentType;
  stationNumber?: number;
};
