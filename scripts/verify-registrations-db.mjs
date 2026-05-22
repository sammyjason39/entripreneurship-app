#!/usr/bin/env node
/**
 * Verify event_registrations table + optional RLS policies in Supabase.
 * Usage: node scripts/verify-registrations-db.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const envPath = new URL('../.env.local', import.meta.url);
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const EXPECTED_COLUMNS = [
  'id',
  'whatsapp_normalized',
  'full_name',
  'student_id',
  'study_program',
  'email',
  'form_email',
  'commit_attendance',
  'interests',
  'info_source',
  'referral_name',
  'user_id',
  'linked_at',
  'created_at',
  'updated_at',
];

const { data: sample, error } = await supabase.from('event_registrations').select('*').limit(1);
if (error) {
  console.error('Table check FAILED:', error.message);
  console.error('→ Run migrations 005_whatsapp_login.sql and 006_admin_registrations_rls.sql in Supabase SQL Editor.');
  process.exit(1);
}

const cols = sample?.[0] ? Object.keys(sample[0]).sort() : EXPECTED_COLUMNS;
const missing = EXPECTED_COLUMNS.filter((c) => !cols.includes(c));
const extra = cols.filter((c) => !EXPECTED_COLUMNS.includes(c));

console.log('✓ event_registrations exists');
if (missing.length) console.log('✗ Missing columns:', missing.join(', '));
else console.log('✓ All expected columns present');
if (extra.length) console.log('  Extra columns:', extra.join(', '));

const { count } = await supabase
  .from('event_registrations')
  .select('*', { count: 'exact', head: true });
console.log(`  Row count: ${count ?? 0}`);

console.log('\nIn Supabase SQL Editor, confirm migration 006 policies:');
console.log(`  SELECT policyname FROM pg_policies WHERE tablename = 'event_registrations';`);
console.log('  Expected 4 policies: admin select/insert/update/delete');
