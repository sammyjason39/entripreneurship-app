import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const get = (k) => env.match(new RegExp(`${k}=(.+)`))?.[1]?.trim();

const url = get('NEXT_PUBLIC_SUPABASE_URL');
const serviceKey = get('SUPABASE_SERVICE_ROLE_KEY');
const anonKey = get('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!url || !serviceKey || !anonKey) {
  console.error('MISSING_ENV');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const anon = createClient(url, anonKey);

const checks = [];

async function run() {
  const { data: stations, error: stErr } = await admin.from('stations').select('id, number, name').order('number');
  checks.push({ name: 'stations', ok: !stErr && (stations?.length ?? 0) === 7, detail: stErr?.message ?? `${stations?.length} rows` });

  const { data: content, error: cErr } = await admin.from('content').select('id').limit(10);
  checks.push({ name: 'content_seed', ok: !cErr && (content?.length ?? 0) >= 10, detail: cErr?.message ?? `${content?.length} rows` });

  const { data: buckets, error: bErr } = await admin.storage.listBuckets();
  const hasSubmissions = buckets?.some((b) => b.name === 'submissions');
  checks.push({ name: 'storage_submissions_bucket', ok: !bErr && !!hasSubmissions, detail: bErr?.message ?? buckets?.map((b) => b.name).join(', ') });

  const { error: authErr } = await anon.auth.signInWithPassword({
    email: 'nonexistent-test@entripreneurship.test',
    password: 'wrongpassword1',
  });
  checks.push({
    name: 'auth_reachable',
    ok: !!authErr && authErr.message !== 'Failed to fetch',
    detail: authErr?.message?.slice(0, 60),
  });

  const failed = checks.filter((c) => !c.ok);
  console.log(JSON.stringify({ checks, passed: failed.length === 0 }, null, 2));
  process.exit(failed.length === 0 ? 0 : 1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
