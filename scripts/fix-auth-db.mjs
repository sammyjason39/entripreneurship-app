/**
 * One-time fix for auth signup (requires database password).
 * Add to .env.local: DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
 * Get it from Supabase Dashboard → Project Settings → Database → Connection string (URI)
 *
 * Run: node scripts/fix-auth-db.mjs
 */
import postgres from 'postgres';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const url = env.DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('Add DATABASE_URL to .env.local (Supabase → Settings → Database → URI)');
  process.exit(1);
}

const sql = readFileSync('supabase/migrations/002_fix_auth_trigger.sql', 'utf8');
const db = postgres(url, { ssl: 'require', max: 1 });

try {
  await db.unsafe(sql);
  console.log('✓ Auth trigger fix applied successfully');
} catch (e) {
  console.error('Failed:', e.message);
  process.exit(1);
} finally {
  await db.end();
}
