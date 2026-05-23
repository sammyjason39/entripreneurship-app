/**
 * Pos 5 — siapa paling cepat "beres" (checkout / durasi di pos).
 * npx tsx scripts/query-pos5-finish.ts
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

function fmtDur(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m > 0) return `${m}m ${sec}d`;
  return `${sec}d`;
}

async function main() {
  loadEnv();
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: pos5 } = await sb.from('stations').select('id, name').eq('number', 5).single();
  if (!pos5) {
    console.log('Pos 5 not found');
    return;
  }

  const { data: visits } = await sb
    .from('station_visits')
    .select('id, team_id, checked_in_at, checked_out_at, status, teams(name)')
    .eq('station_id', pos5.id)
    .order('checked_in_at', { ascending: true });

  console.log(`Station: ${pos5.name}`);
  console.log(`Total visits: ${visits?.length ?? 0}\n`);

  type Row = {
    name: string;
    checked_in_at: string;
    checked_out_at: string | null;
    status: string;
    durationMs: number | null;
  };

  const rows: Row[] = (visits ?? []).map((v) => {
    const name = teamName(v.teams) ?? v.team_id;
    const out = v.checked_out_at;
    const dur =
      out != null
        ? new Date(out).getTime() - new Date(v.checked_in_at).getTime()
        : null;
    return {
      name,
      checked_in_at: v.checked_in_at,
      checked_out_at: out,
      status: v.status,
      durationMs: dur,
    };
  });

  const completed = rows.filter((r) => r.checked_out_at != null && r.durationMs != null);

  console.log('=== Paling cepat BERES (durasi terpendek di Pos 5: checkout − check-in) ===');
  const byDuration = [...completed].sort((a, b) => a.durationMs! - b.durationMs!);
  if (byDuration[0]) {
    const w = byDuration[0];
    console.log(`#1 ${w.name} — ${fmtDur(w.durationMs!)}`);
    console.log(`   Check-in  ${fmt(w.checked_in_at)}`);
    console.log(`   Checkout  ${fmt(w.checked_out_at!)}`);
  } else {
    console.log('(belum ada tim yang checkout di Pos 5)');
  }
  console.log('\nTop 10 durasi terpendek:');
  byDuration.slice(0, 10).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.name} — ${fmtDur(r.durationMs!)}`);
  });

  console.log('\n=== Pertama selesai checkout (checked_out_at paling awal) ===');
  const byCheckout = [...completed].sort(
    (a, b) => new Date(a.checked_out_at!).getTime() - new Date(b.checked_out_at!).getTime()
  );
  if (byCheckout[0]) {
    const w = byCheckout[0];
    console.log(`#1 ${w.name} — checkout ${fmt(w.checked_out_at!)}`);
  }
  byCheckout.slice(0, 10).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.name} — ${fmt(r.checked_out_at!)} (${fmtDur(r.durationMs!)})`);
  });

  console.log('\n=== Pertama datang Pos 5 (check-in paling awal) ===');
  const byArrival = [...rows].sort(
    (a, b) => new Date(a.checked_in_at).getTime() - new Date(b.checked_in_at).getTime()
  );
  if (byArrival[0]) {
    console.log(`#1 ${byArrival[0].name} — ${fmt(byArrival[0].checked_in_at)}`);
  }
  byArrival.slice(0, 10).forEach((r, i) => {
    const tag = r.checked_out_at ? 'selesai' : 'masih di pos / belum checkout';
    console.log(`  ${i + 1}. ${r.name} — check-in ${fmt(r.checked_in_at)} (${tag})`);
  });

  const stillActive = rows.filter((r) => !r.checked_out_at);
  if (stillActive.length) {
    console.log(`\n(${stillActive.length} tim belum checkout: ${stillActive.map((r) => r.name).join(', ')})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
