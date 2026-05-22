/**
 * Sync event booklet content (lib/event-content.ts) into Supabase `content` table.
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { CASE_STUDIES, INNOVATION_CARDS } from '../lib/event-content';

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });

  const rows = [
    ...CASE_STUDIES.map((c) => ({
      type: 'case_study' as const,
      company: c.company,
      title: `${c.company} — Case Study`,
      body: c.caseStudy.question,
      station_number: c.stationNumber,
      sort_order: c.sortOrder,
      metadata: {
        slug: c.slug,
        profile: c.profile,
        caseStudy: c.caseStudy,
      },
    })),
    ...INNOVATION_CARDS.map((c) => ({
      type: 'innovation_card' as const,
      company: c.company,
      title: `${c.company} — Innovation Card`,
      body: c.sections.map((s) => s.title).join(' · '),
      station_number: c.stationNumber,
      sort_order: c.sortOrder,
      metadata: {
        slug: c.slug,
        sections: c.sections,
      },
    })),
  ];

  const { error: delErr } = await admin.from('content').delete().neq('company', '');
  if (delErr) console.warn('Delete existing content:', delErr.message);

  const { error } = await admin.from('content').upsert(rows, { onConflict: 'type,company' });
  if (error) {
    console.error('Upsert failed:', error.message);
    process.exit(1);
  }

  console.log(`Seeded ${rows.length} content rows (5 case studies + 5 innovation cards).`);
}

main();
