/**
 * One-off leaderboard snapshot (richest + fastest).
 * npx tsx scripts/query-leaderboard-snapshot.ts
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local');
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    const key = line.slice(0, i);
    const val = line.slice(i + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

function elapsedMs(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  return new Date(end).getTime() - new Date(start).getTime();
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}j ${m}m ${sec}d`;
  if (m > 0) return `${m}m ${sec}d`;
  return `${sec}d`;
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const { data: teams, error: tErr } = await sb
    .from('teams')
    .select('id, name, balance, race_started_at, race_finished_at')
    .order('balance', { ascending: false });
  if (tErr) throw tErr;

  const richest = teams?.[0];
  const topBalance = teams?.slice(0, 5) ?? [];

  const withRace = (teams ?? [])
    .filter((t) => t.race_started_at)
    .map((t) => ({
      ...t,
      elapsed: elapsedMs(t.race_started_at, t.race_finished_at),
      finished: !!t.race_finished_at,
    }))
    .sort((a, b) => {
      if (a.finished && b.finished) return a.elapsed! - b.elapsed!;
      if (a.finished) return -1;
      if (b.finished) return 1;
      return a.elapsed! - b.elapsed!;
    });

  const fastestFinished = withRace.find((t) => t.finished) ?? null;

  console.log('\n=== RICHEST (EnCoin balance) ===');
  if (richest) {
    console.log(`#1 ${richest.name}: ${richest.balance} EC`);
  }
  console.log('\nTop 5 balance:');
  for (const [i, t] of topBalance.entries()) {
    console.log(`  ${i + 1}. ${t.name} — ${t.balance} EC`);
  }

  console.log('\n=== FASTEST (race timer — same as app leaderboard) ===');
  if (fastestFinished) {
    console.log(
      `${fastestFinished.name} — ${formatMs(fastestFinished.elapsed!)} (finish ${fastestFinished.race_finished_at})`
    );
  } else if (withRace.length > 0) {
    const lead = withRace[0]!;
    console.log(`(belum ada yang finish Pos 7 — terdepan sementara: ${lead.name} ${formatMs(lead.elapsed!)} berlari)`);
  } else {
    console.log('(belum ada tim dengan race_started_at)');
  }
  if (withRace.length > 0) {
    console.log('\nTop 5 race time:');
    for (const [i, t] of withRace.slice(0, 5).entries()) {
      const tag = t.finished ? 'selesai' : 'berlari';
      console.log(`  ${i + 1}. ${t.name} — ${formatMs(t.elapsed!)} (${tag})`);
    }
  }

  const { data: pos6 } = await sb.from('stations').select('id, name').eq('number', 6).single();
  if (pos6) {
    const { data: visits } = await sb
      .from('station_visits')
      .select('checked_in_at, checked_out_at, teams(name)')
      .eq('station_id', pos6.id)
      .order('checked_in_at', { ascending: true });

    const firstByTeam = new Map<string, { name: string; checked_in_at: string }>();
    for (const v of visits ?? []) {
      const raw = v.teams as { name: string } | { name: string }[] | null;
      const name = Array.isArray(raw) ? raw[0]?.name : raw?.name;
      if (!name) continue;
      if (!firstByTeam.has(name)) {
        firstByTeam.set(name, { name, checked_in_at: v.checked_in_at });
      }
    }
    const pos6Ranked = [...firstByTeam.values()].sort(
      (a, b) => new Date(a.checked_in_at).getTime() - new Date(b.checked_in_at).getTime()
    );

    console.log(`\n=== FASTEST AT POS 6 (first check-in timestamp) ===`);
    if (pos6Ranked[0]) {
      const w = pos6Ranked[0];
      console.log(
        `${w.name} — ${new Date(w.checked_in_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`
      );
    } else {
      console.log('(belum ada check-in Pos 6)');
    }
    console.log('\nTop 10 arrival Pos 6:');
    for (const [i, row] of pos6Ranked.slice(0, 10).entries()) {
      console.log(
        `  ${i + 1}. ${row.name} — ${new Date(row.checked_in_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
