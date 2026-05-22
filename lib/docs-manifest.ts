export type DocGroup = 'start' | 'guides' | 'technical';

export type DocEntry = {
  slug: string;
  filename: string;
  title: string;
  group: DocGroup;
  description?: string;
};

export const DOC_ENTRIES: DocEntry[] = [
  {
    slug: 'index',
    filename: 'README.md',
    title: 'Documentation home',
    group: 'start',
    description: 'Overview and links to all guides',
  },
  {
    slug: 'guide-participant',
    filename: 'GUIDE_PARTICIPANT.md',
    title: 'Participant guide',
    group: 'guides',
    description: 'WhatsApp login, teams, missions, EnCoins',
  },
  {
    slug: 'guide-crew',
    filename: 'GUIDE_CREW.md',
    title: 'Crew guide',
    group: 'guides',
    description: 'Station QR, tracking, bank desk',
  },
  {
    slug: 'guide-admin',
    filename: 'GUIDE_ADMIN.md',
    title: 'Admin / jury guide',
    group: 'guides',
    description: 'Dashboard, submissions, roster, crew',
  },
  {
    slug: 'crew-logins',
    filename: 'CREW_LOGINS.md',
    title: 'Crew & admin logins',
    group: 'technical',
    description: 'Emails, passwords, transaction PIN',
  },
  {
    slug: 'whatsapp-login',
    filename: 'WHATSAPP_LOGIN.md',
    title: 'WhatsApp login (n8n)',
    group: 'technical',
    description: 'Webhook and roster flow',
  },
  {
    slug: 'whatsapp-waha',
    filename: 'WHATSAPP_WAHA.md',
    title: 'WhatsApp (WAHA)',
    group: 'technical',
    description: 'WAHA integration notes',
  },
  {
    slug: 'station-qr',
    filename: 'STATION_QR.md',
    title: 'Station QR check-in',
    group: 'technical',
    description: 'Check-in, checkout, tracking',
  },
  {
    slug: 'testing',
    filename: 'TESTING.md',
    title: 'Testing & verification',
    group: 'technical',
    description: 'E2E and smoke tests',
  },
];

const GROUP_LABELS: Record<DocGroup, string> = {
  start: 'Overview',
  guides: 'Guides',
  technical: 'Technical',
};

export function getDocGroupLabel(group: DocGroup): string {
  return GROUP_LABELS[group];
}

export function getDocBySlug(slug: string): DocEntry | undefined {
  return DOC_ENTRIES.find((d) => d.slug === slug);
}

export function getAllDocSlugs(): string[] {
  return DOC_ENTRIES.map((d) => d.slug);
}

export function getDocsByGroup(group: DocGroup): DocEntry[] {
  return DOC_ENTRIES.filter((d) => d.group === group);
}
