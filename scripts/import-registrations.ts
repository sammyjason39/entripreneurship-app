/**
 * Import EnTripreneurship Registration.csv into event_registrations.
 *
 * Usage:
 *   npx tsx scripts/import-registrations.ts
 *   npx tsx scripts/import-registrations.ts --dry-run
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run migration 005_whatsapp_login.sql in Supabase first.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { normalizeWhatsAppPhone } from '../lib/phone';

const CSV_PATH = resolve(__dirname, '../data/registrations.csv');
const COMMIT_YES = 'yes, with my pleasure!';

type Row = {
  fullName: string;
  studentId: string;
  studyProgram: string;
  whatsapp: string;
  email: string;
  formEmail: string;
  commit: string;
  interests: string;
  infoSource: string;
  referral: string;
  completionTime: string;
};

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === ',' && !inQuotes) {
      out.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

function parseCsv(content: string): Row[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]!);
    if (cols.length < 9) continue;
    const fullName = (cols[5] || cols[4] || '').trim();
    const whatsapp = (cols[8] || '').trim();
    if (!whatsapp || !fullName) continue;
    rows.push({
      fullName,
      studentId: cols[6]?.trim() ?? '',
      studyProgram: cols[7]?.trim() ?? '',
      whatsapp,
      formEmail: cols[3]?.trim() ?? '',
      email: cols[3]?.includes('@') ? cols[3].trim() : '',
      commit: cols[10]?.trim() ?? '',
      interests: cols[9]?.trim() ?? '',
      infoSource: cols[11]?.trim() ?? '',
      referral: cols[12]?.trim() ?? '',
      completionTime: cols[2]?.trim() ?? '',
    });
  }
  return rows;
}

function pickBestRow(existing: Row, incoming: Row): Row {
  const existingYes = existing.commit.toLowerCase() === COMMIT_YES;
  const incomingYes = incoming.commit.toLowerCase() === COMMIT_YES;
  if (incomingYes && !existingYes) return incoming;
  if (existingYes && !incomingYes) return existing;
  if (incoming.completionTime > existing.completionTime) return incoming;
  return existing;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!dryRun && (!url || !key)) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const raw = readFileSync(CSV_PATH, 'utf8');
  const parsed = parseCsv(raw);
  const byPhone = new Map<string, Row & { normalized: string }>();

  for (const row of parsed) {
    const normalized = normalizeWhatsAppPhone(row.whatsapp);
    if (!normalized) {
      console.warn('Skip invalid phone:', row.fullName, row.whatsapp);
      continue;
    }
    const prev = byPhone.get(normalized);
    byPhone.set(
      normalized,
      prev ? { ...pickBestRow(prev, row), normalized } : { ...row, normalized }
    );
  }

  const records = Array.from(byPhone.values()).map((r) => ({
    whatsapp_normalized: r.normalized,
    full_name: r.fullName,
    student_id: r.studentId || null,
    study_program: r.studyProgram || null,
    email: r.email || null,
    form_email: r.formEmail || null,
    commit_attendance: r.commit || null,
    interests: r.interests || null,
    info_source: r.infoSource || null,
    referral_name: r.referral || null,
  }));

  console.log(`Parsed ${parsed.length} rows → ${records.length} unique WhatsApp numbers`);

  if (dryRun) {
    console.log('Dry run — first 3:', records.slice(0, 3));
    return;
  }

  const supabase = createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: delError } = await supabase.from('event_registrations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) console.warn('Clear existing (optional):', delError.message);

  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('event_registrations').upsert(batch, {
      onConflict: 'whatsapp_normalized',
    });
    if (error) {
      console.error('Upsert failed:', error.message);
      process.exit(1);
    }
    console.log(`Upserted ${Math.min(i + batchSize, records.length)} / ${records.length}`);
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
