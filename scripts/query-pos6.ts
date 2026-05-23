/**
 * Pos 6 timing snapshot: station_visits check-in vs compete timer.
 * npx tsx scripts/query-pos6.ts
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
    if (!process.env[line.slice(0, i)]) process.env[line.slice(0, i)] = line.slice(i + 1);
  }
}

function teamName(teams: unknown): string | null {
  const raw = teams as { name: string } | { name: string }[] | null;
  return Array.isArray(raw) ? raw[0]?.name ?? null : raw?.name ?? null;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
}

async function main() {
  loadEnv();
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: pos6 } = await sb.from('stations').select('id, name, number').eq('number', 6).single();
  console.log('Station:', pos6);

  const { data: visits } = await sb
    .from('station_visits')
    .select('checked_in_at, checked_out_at, teams(name)')
    .eq('station_id', pos6?.id ?? '')
    .order('checked_in_at', { ascending: true });
  console.log('\n--- station_visits at Pos 6:', visits?.length ?? 0);
  const firstVisit = new Map<string, string>();
  for (const v of visits ?? []) {
    const name = teamName(v.teams);
    if (!name || firstVisit.has(name)) continue;
    firstVisit.set(name, v.checked_in_at);
  }
  const visitRank = [...firstVisit.entries()]
    .map(([name, at]) => ({ name, at }))
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  visitRank.slice(0, 10).forEach((r, i) => console.log(`  ${i + 1}. ${r.name} check-in ${fmt(r.at)}`));

  const { data: runs } = await sb
    .from('team_compete_runs')
    .select('started_at, ended_at, elapsed_ms, teams(name)')
    .eq('station_number', 6)
    .order('started_at', { ascending: true });
  console.log('\n--- team_compete_runs Pos 6:', runs?.length ?? 0);
  const firstStart = new Map<string, { name: string; started_at: string; ended_at: string | null; elapsed_ms: number | null }>();
  for (const r of runs ?? []) {
    const name = teamName(r.teams);
    if (!name || firstStart.has(name)) continue;
    firstStart.set(name, {
      name,
      started_at: r.started_at,
      ended_at: r.ended_at,
      elapsed_ms: r.elapsed_ms,
    });
  }
  const startRank = [...firstStart.values()].sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
  );
  startRank.slice(0, 10).forEach((r, i) => {
    const end = r.ended_at ? ` selesai ${fmt(r.ended_at)} (${r.elapsed_ms}ms)` : ' (timer masih jalan)';
    console.log(`  ${i + 1}. ${r.name} start ${fmt(r.started_at)}${end}`);
  });

  const finished = [...firstStart.values()]
    .filter((r) => r.ended_at && r.elapsed_ms != null)
    .sort((a, b) => a.elapsed_ms! - b.elapsed_ms!);
  console.log('\n--- Fastest Pos 6 compete (shortest elapsed_ms):');
  if (finished[0]) {
    const w = finished[0];
    const sec = Math.floor(w.elapsed_ms! / 1000);
    console.log(`  #1 ${w.name} — ${sec}s (${w.elapsed_ms} ms)`);
  } else {
    console.log('  (belum ada run selesai)');
  }
  finished.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.name} — ${Math.floor(r.elapsed_ms! / 1000)}s`);
  });

  // visits by station number summary
  const { data: allSt } = await sb.from('stations').select('id, number');
  const stMap = new Map((allSt ?? []).map((s) => [s.id, s.number]));
  const { data: allVis } = await sb.from('station_visits').select('station_id, checked_in_at');
  const counts = new Map<number, number>();
  for (const v of allVis ?? []) {
    const n = stMap.get(v.station_id);
    if (n != null) counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  console.log('\n--- Check-ins per station:', Object.fromEntries([...counts.entries()].sort((a, b) => a[0] - b[0])));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
