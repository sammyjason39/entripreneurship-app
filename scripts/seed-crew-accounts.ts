/**
 * Create premade crew / admin logins (email + password).
 *
 * Usage:
 *   npx tsx scripts/seed-crew-accounts.ts
 *   npx tsx scripts/seed-crew-accounts.ts --dry-run
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { buildAssignmentLabel } from '../lib/admin';
import type { CrewAssignmentKind } from '../lib/types';

const CREW_PASSWORD = 'EntripCrew2026!';
const ADMIN_PASSWORD = 'EntripAdmin2026!';

type SeedAccount = {
  email: string;
  fullName: string;
  appRole: 'crew' | 'admin';
  assignmentKind: CrewAssignmentKind;
  stationNumber: number | null;
};

const ACCOUNTS: SeedAccount[] = [
  {
    email: 'admin@entripreneurship.fun',
    fullName: 'Event Admin',
    appRole: 'admin',
    assignmentKind: 'general',
    stationNumber: null,
  },
  {
    email: 'bank@entripreneurship.fun',
    fullName: 'Bank Desk',
    appRole: 'crew',
    assignmentKind: 'bank',
    stationNumber: null,
  },
  {
    email: 'jury@entripreneurship.fun',
    fullName: 'Jury / MC',
    appRole: 'crew',
    assignmentKind: 'jury',
    stationNumber: null,
  },
  {
    email: 'registration@entripreneurship.fun',
    fullName: 'Registration Desk',
    appRole: 'crew',
    assignmentKind: 'registration',
    stationNumber: null,
  },
  {
    email: 'roaming@entripreneurship.fun',
    fullName: 'Roaming Crew',
    appRole: 'crew',
    assignmentKind: 'roaming',
    stationNumber: null,
  },
  ...([1, 2, 3, 4, 5, 6, 7] as const).map((n) => ({
    email: `station${n}@entripreneurship.fun`,
    fullName: `Station ${n} Judge`,
    appRole: 'crew' as const,
    assignmentKind: 'station' as const,
    stationNumber: n,
  })),
];

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local');
  const lines = readFileSync(path, 'utf8').split('\n');
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    const key = line.slice(0, i);
    const val = line.slice(i + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

async function findUserIdByEmail(
  service: ReturnType<typeof createClient>,
  email: string
): Promise<string | null> {
  let page = 1;
  const target = email.toLowerCase();
  while (page <= 20) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
    page++;
  }
  return null;
}

async function ensureAccount(
  service: ReturnType<typeof createClient>,
  account: SeedAccount,
  stationByNumber: Map<number, { id: string; name: string }>,
  adminUserId: string,
  dryRun: boolean
) {
  const email = account.email.toLowerCase();
  const password = account.appRole === 'admin' ? ADMIN_PASSWORD : CREW_PASSWORD;
  const station = account.stationNumber
    ? stationByNumber.get(account.stationNumber)
    : null;

  if (dryRun) {
    console.log(`[dry-run] ${email} (${account.appRole}) → ${password}`);
    return email;
  }

  let userId = await findUserIdByEmail(service, email);

  if (!userId) {
    const { data: created, error } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    });
    if (error || !created.user) throw new Error(error?.message ?? `Create failed: ${email}`);
    userId = created.user.id;
    console.log(`Created ${email}`);
  } else {
    const { error } = await service.auth.admin.updateUserById(userId, { password });
    if (error) throw new Error(error.message);
    console.log(`Updated password ${email}`);
  }

  const { error: profileError } = await service.from('profiles').upsert(
    {
      id: userId,
      full_name: account.fullName,
      app_role: account.appRole,
      onboarding_complete: true,
    },
    { onConflict: 'id' }
  );
  if (profileError) throw new Error(profileError.message);

  if (account.appRole === 'crew') {
    const label = buildAssignmentLabel(
      account.assignmentKind,
      station?.name ?? null,
      undefined
    );
    const { error: assignError } = await service.from('crew_assignments').upsert(
      {
        user_id: userId,
        assignment_label: label,
        assignment_kind: account.assignmentKind,
        station_id: station?.id ?? null,
        assigned_by: adminUserId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    if (assignError) throw new Error(assignError.message);
  }

  return email;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const service = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: stations, error: stError } = await service
    .from('stations')
    .select('id, number, name')
    .order('number');
  if (stError) throw new Error(stError.message);

  const stationByNumber = new Map(
    (stations ?? []).map((s) => [s.number as number, { id: s.id, name: s.name }])
  );

  if (dryRun) {
    for (const a of ACCOUNTS) await ensureAccount(service, a, stationByNumber, '', true);
    console.log('\nDry run complete. See docs/CREW_LOGINS.md for passwords.');
    return;
  }

  const adminSeed = ACCOUNTS[0]!;
  let adminUserId = await findUserIdByEmail(service, adminSeed.email);
  if (!adminUserId) {
    await ensureAccount(service, adminSeed, stationByNumber, '', false);
    adminUserId = (await findUserIdByEmail(service, adminSeed.email))!;
  } else {
    await ensureAccount(service, adminSeed, stationByNumber, adminUserId, false);
  }

  for (const account of ACCOUNTS.slice(1)) {
    await ensureAccount(service, account, stationByNumber, adminUserId, false);
  }

  console.log('\nDone. Credentials: docs/CREW_LOGINS.md');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
