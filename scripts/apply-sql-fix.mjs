/**
 * Applies 002_fix_auth_trigger.sql via Supabase Management API.
 * Requires SUPABASE_ACCESS_TOKEN env (Personal Access Token from supabase.com/dashboard/account/tokens)
 * and project ref from NEXT_PUBLIC_SUPABASE_URL.
 */
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

const ref = env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!ref || !token) {
  console.error('Need SUPABASE_ACCESS_TOKEN and NEXT_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}

const sql = readFileSync('supabase/migrations/002_fix_auth_trigger.sql', 'utf8');

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const body = await res.text();
console.log(res.status, body.slice(0, 500));
process.exit(res.ok ? 0 : 1);
