/**
 * Local E2E smoke test — hits Next.js + Supabase
 * Run: node scripts/e2e-local.mjs (dev server on :3000)
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const BASE = 'http://localhost:3000';
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ts = Date.now();
const email = `e2e.${ts}@entripreneurship.test`;
const password = 'TestPass123!';
const pin = '123456';

const results = [];

function pass(name, detail = '') {
  results.push({ name, ok: true, detail });
}
function fail(name, detail = '') {
  results.push({ name, ok: false, detail });
}

async function fetchJson(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { res, json };
}

async function main() {
  // Pages (public)
  for (const path of ['/auth/login', '/auth/register', '/offline']) {
    const res = await fetch(`${BASE}${path}`);
    if (res.ok) pass(`page ${path}`, String(res.status));
    else fail(`page ${path}`, String(res.status));
  }

  // Health
  const health = await fetchJson('/api/health');
  if (health.json?.ok) pass('api health');
  else fail('api health', JSON.stringify(health.json));

  // Sign up
  const { data: signUp, error: signErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `E2E Tester ${ts}` },
  });
  if (signErr) {
    fail('create user', signErr.message);
    printAndExit();
  }
  pass('create user', email);

  const userId = signUp.user.id;
  await admin.from('profiles').upsert({
    id: userId,
    full_name: `E2E Tester ${ts}`,
    app_role: 'participant',
  });
  await new Promise((r) => setTimeout(r, 300));

  const { data: profile } = await admin.from('profiles').select('*').eq('id', userId).single();
  if (profile?.qr_token) pass('profile + qr_token');
  else fail('profile + qr_token', profile ? 'no qr_token' : 'no profile row');

  // Sign in for cookie session
  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: session, error: loginErr } = await anon.auth.signInWithPassword({ email, password });
  if (loginErr || !session.session) {
    fail('login', loginErr?.message);
    printAndExit();
  }
  pass('login');

  const authHeader = { Authorization: `Bearer ${session.session.access_token}` };

  // PIN
  let r = await fetchJson('/api/onboarding/pin', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ pin }),
  });
  if (r.res.ok) pass('api set pin');
  else fail('api set pin', JSON.stringify(r.json));

  // Create team
  r = await fetchJson('/api/onboarding/team/create', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ name: `E2E Team ${ts}` }),
  });
  if (r.res.ok && r.json.join_code) pass('api create team', r.json.join_code);
  else fail('api create team', JSON.stringify(r.json));

  // Complete onboarding
  r = await fetchJson('/api/onboarding/complete', {
    method: 'POST',
    headers: authHeader,
  });
  if (r.res.ok) pass('api complete onboarding');
  else fail('api complete onboarding', JSON.stringify(r.json));

  // Verify pin
  r = await fetchJson('/api/verify-pin', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ pin }),
  });
  if (r.json?.valid) pass('api verify pin');
  else fail('api verify pin', JSON.stringify(r.json));

  // QR session
  r = await fetchJson('/api/qr-sessions', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ pin }),
  });
  if (r.res.ok && r.json.token) pass('api qr session', r.json.token);
  else fail('api qr session', JSON.stringify(r.json));

  // Team balance row
  const { data: member } = await admin
    .from('team_members')
    .select('team_id, teams(balance, name)')
    .eq('user_id', userId)
    .single();
  if (member?.team_id) pass('team membership', member.teams?.name);
  else fail('team membership');

  // Cleanup test user
  await admin.auth.admin.deleteUser(userId);
  pass('cleanup user');

  printAndExit();
}

function printAndExit() {
  const failed = results.filter((r) => !r.ok);
  console.log('\n=== E2E Results ===');
  results.forEach((r) => console.log(r.ok ? '✓' : '✗', r.name, r.detail || ''));
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
