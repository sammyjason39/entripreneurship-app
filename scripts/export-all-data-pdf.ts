/**
 * Export all participant + event data (including submissions) to one PDF.
 *
 * Usage:
 *   npx tsx scripts/export-all-data-pdf.ts
 *   npx tsx scripts/export-all-data-pdf.ts --out exports/my-export.pdf
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createWriteStream, mkdirSync } from 'fs';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import PDFDocument from 'pdfkit';
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

function fmt(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
}

function fmtPhone(normalized: string | null | undefined): string {
  if (!normalized) return '—';
  if (normalized.startsWith('62')) return `0${normalized.slice(2)}`;
  return normalized;
}

function teamName(teams: unknown): string {
  const raw = teams as { name: string } | { name: string }[] | null;
  return Array.isArray(raw) ? raw[0]?.name ?? '—' : raw?.name ?? '—';
}

function profileName(profiles: unknown): string {
  const raw = profiles as { full_name: string } | { full_name: string }[] | null;
  return Array.isArray(raw) ? raw[0]?.full_name ?? '—' : raw?.full_name ?? '—';
}

function stationLabel(stations: unknown): string {
  const raw = stations as { number: number; name: string } | { number: number; name: string }[] | null;
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s) return '—';
  return `Pos ${s.number} — ${s.name}`;
}

type Doc = InstanceType<typeof PDFDocument>;

function ensureSpace(doc: Doc, needed = 80) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function sectionTitle(doc: Doc, title: string) {
  ensureSpace(doc, 60);
  doc.moveDown(0.5);
  doc.fontSize(16).fillColor('#1a365d').text(title, { underline: true });
  doc.fillColor('#000000');
  doc.moveDown(0.3);
  doc.fontSize(10);
}

function field(doc: Doc, label: string, value: string | number | null | undefined) {
  const text = value == null || value === '' ? '—' : String(value);
  ensureSpace(doc, 30);
  doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
  doc.font('Helvetica').text(text, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right });
}

function paragraph(doc: Doc, text: string) {
  ensureSpace(doc, 40);
  doc.font('Helvetica').text(text, {
    width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
  });
}

function divider(doc: Doc) {
  ensureSpace(doc, 20);
  doc.moveDown(0.3);
  doc
    .strokeColor('#cbd5e0')
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke();
  doc.strokeColor('#000000');
  doc.moveDown(0.5);
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const outArg = process.argv.indexOf('--out');
  const defaultName = `entripreneurship-full-export-${new Date().toISOString().slice(0, 10)}.pdf`;
  const outPath = resolve(
    process.cwd(),
    outArg >= 0 ? process.argv[outArg + 1]! : `exports/${defaultName}`
  );
  mkdirSync(resolve(outPath, '..'), { recursive: true });

  const sb = createClient(url, key, { auth: { persistSession: false } });
  const generatedAt = fmt(new Date().toISOString());

  const [
    registrationsRes,
    profilesRes,
    teamsRes,
    membersRes,
    submissionsRes,
    visitsRes,
    transactionsRes,
    economyRes,
    competeRes,
    stationsRes,
  ] = await Promise.all([
    sb.from('event_registrations').select('*').order('full_name'),
    sb.from('profiles').select('*').eq('app_role', 'participant').order('full_name'),
    sb
      .from('teams')
      .select(
        'id, name, ceo_id, join_code, balance, business_idea, company_track, race_started_at, race_finished_at, innovative_score, outfit_score, created_at'
      )
      .order('name'),
    sb
      .from('team_members')
      .select('id, team_id, user_id, team_role, joined_at, profiles(full_name, student_id, whatsapp_normalized)'),
    sb
      .from('submissions')
      .select(
        'id, team_id, station_id, submitted_by, form_data, image_url, status, rejection_note, submitted_at, reviewed_at, reviewed_by, teams(name), stations(number, name), profiles:submitted_by(full_name)'
      )
      .order('submitted_at'),
    sb
      .from('station_visits')
      .select(
        'id, team_id, station_id, checked_in_at, checked_in_by, checked_out_at, checked_out_by, status, teams(name), stations(number, name)'
      )
      .order('checked_in_at'),
    sb
      .from('transactions')
      .select('*')
      .order('created_at'),
    sb.from('team_economy_events').select('*').order('created_at'),
    sb
      .from('team_compete_runs')
      .select('id, team_id, station_number, started_at, ended_at, elapsed_ms, teams(name)')
      .order('started_at'),
    sb.from('stations').select('id, number, name').order('number'),
  ]);

  for (const [name, res] of [
    ['event_registrations', registrationsRes],
    ['profiles', profilesRes],
    ['teams', teamsRes],
    ['team_members', membersRes],
    ['submissions', submissionsRes],
    ['station_visits', visitsRes],
    ['transactions', transactionsRes],
    ['team_economy_events', economyRes],
    ['team_compete_runs', competeRes],
    ['stations', stationsRes],
  ] as const) {
    if (res.error) throw new Error(`${name}: ${res.error.message}`);
  }

  const registrations = registrationsRes.data ?? [];
  const profiles = profilesRes.data ?? [];
  const teams = teamsRes.data ?? [];
  const members = membersRes.data ?? [];
  const submissions = submissionsRes.data ?? [];
  const visits = visitsRes.data ?? [];
  const transactions = transactionsRes.data ?? [];
  const economyEvents = economyRes.data ?? [];
  const competeRuns = competeRes.data ?? [];
  const stations = stationsRes.data ?? [];

  const teamById = new Map(teams.map((t) => [t.id, t]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const stationById = new Map(stations.map((s) => [s.id, s]));
  const membersByTeam = new Map<string, typeof members>();
  for (const m of members) {
    const list = membersByTeam.get(m.team_id) ?? [];
    list.push(m);
    membersByTeam.set(m.team_id, list);
  }

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const stream = createWriteStream(outPath);
  doc.pipe(stream);

  // Cover
  doc.fontSize(22).fillColor('#1a365d').text('EnTripreneurship Vol. 2', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(14).fillColor('#000000').text('Laporan Lengkap Data Peserta & Event', { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(10).text(`Diekspor: ${generatedAt} WIB`, { align: 'center' });
  doc.moveDown(0.5);
  doc.text(`Registrasi: ${registrations.length} · Profil app: ${profiles.length} · Tim: ${teams.length}`, {
    align: 'center',
  });
  doc.text(`Submission: ${submissions.length} · Kunjungan pos: ${visits.length} · Transaksi: ${transactions.length}`, {
    align: 'center',
  });

  // 1. Registrations
  doc.addPage();
  sectionTitle(doc, `1. Registrasi Peserta (${registrations.length})`);
  registrations.forEach((r, i) => {
    ensureSpace(doc, 120);
    doc.font('Helvetica-Bold').fontSize(11).text(`${i + 1}. ${r.full_name}`);
    doc.fontSize(10);
    field(doc, 'WhatsApp', fmtPhone(r.whatsapp_normalized));
    field(doc, 'NIM / Student ID', r.student_id);
    field(doc, 'Program studi', r.study_program);
    field(doc, 'Email', r.email);
    field(doc, 'Email (form)', r.form_email);
    field(doc, 'Komitmen hadir', r.commit_attendance);
    field(doc, 'Minat', r.interests);
    field(doc, 'Sumber info', r.info_source);
    field(doc, 'Referral', r.referral_name);
    field(doc, 'User app terhubung', r.user_id ? 'Ya' : 'Belum');
    field(doc, 'Linked at', fmt(r.linked_at));
    field(doc, 'Dibuat', fmt(r.created_at));
    divider(doc);
  });

  // 2. Profiles
  doc.addPage();
  sectionTitle(doc, `2. Profil App — Participant (${profiles.length})`);
  profiles.forEach((p, i) => {
    ensureSpace(doc, 90);
    doc.font('Helvetica-Bold').fontSize(11).text(`${i + 1}. ${p.full_name}`);
    doc.fontSize(10);
    field(doc, 'ID', p.id);
    field(doc, 'NIM', p.student_id);
    field(doc, 'WhatsApp', fmtPhone(p.whatsapp_normalized));
    field(doc, 'Onboarding selesai', p.onboarding_complete ? 'Ya' : 'Tidak');
    field(doc, 'QR token', p.qr_token);
    field(doc, 'Dibuat', fmt(p.created_at));
    divider(doc);
  });

  // 3. Teams + members
  doc.addPage();
  sectionTitle(doc, `3. Tim & Anggota (${teams.length})`);
  teams.forEach((t, i) => {
    ensureSpace(doc, 160);
    doc.font('Helvetica-Bold').fontSize(11).text(`${i + 1}. ${t.name}`);
    doc.fontSize(10);
    field(doc, 'Join code', t.join_code);
    field(doc, 'Saldo EnCoin', t.balance);
    field(doc, 'Company track', t.company_track);
    field(doc, 'Business idea', t.business_idea);
    field(doc, 'Skor inovasi', t.innovative_score);
    field(doc, 'Skor outfit', t.outfit_score);
    field(doc, 'Race start', fmt(t.race_started_at));
    field(doc, 'Race finish', fmt(t.race_finished_at));
    field(doc, 'CEO ID', t.ceo_id);
    const ceo = profileById.get(t.ceo_id);
    if (ceo) field(doc, 'CEO', ceo.full_name);

    const tm = membersByTeam.get(t.id) ?? [];
    if (tm.length) {
      paragraph(doc, 'Anggota:');
      for (const m of tm) {
        const name = profileName(m.profiles);
        const sid = (m.profiles as { student_id?: string } | null)?.student_id ?? '';
        paragraph(doc, `  • ${m.team_role}: ${name}${sid ? ` (${sid})` : ''} — join ${fmt(m.joined_at)}`);
      }
    } else {
      paragraph(doc, 'Anggota: (belum ada)');
    }
    divider(doc);
  });

  // 4. Submissions — main request
  doc.addPage();
  sectionTitle(doc, `4. Submission Stasiun (${submissions.length})`);
  if (submissions.length === 0) {
    paragraph(doc, 'Belum ada submission.');
  }
  submissions.forEach((s, i) => {
    ensureSpace(doc, 180);
    const tName = teamName(s.teams);
    const stLabel = stationLabel(s.stations);
    const submitter = profileName(s.profiles);

    doc.font('Helvetica-Bold').fontSize(11).text(`${i + 1}. ${tName} — ${stLabel}`);
    doc.fontSize(10);
    field(doc, 'Status', s.status);
    field(doc, 'Dikirim oleh', submitter);
    field(doc, 'Waktu submit', fmt(s.submitted_at));
    field(doc, 'Reviewed at', fmt(s.reviewed_at));
    if (s.rejection_note) field(doc, 'Catatan penolakan', s.rejection_note);
    if (s.image_url) field(doc, 'Gambar', s.image_url);

    const formData = s.form_data as Record<string, string> | null;
    if (formData && Object.keys(formData).length) {
      paragraph(doc, 'Isi form:');
      for (const [k, v] of Object.entries(formData)) {
        ensureSpace(doc, 40);
        doc.font('Helvetica-Bold').text(`  ${k}:`, { continued: true });
        doc.font('Helvetica').text(` ${v}`, {
          width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 20,
        });
      }
    } else {
      field(doc, 'Isi form', '(kosong)');
    }
    divider(doc);
  });

  // 5. Station visits
  doc.addPage();
  sectionTitle(doc, `5. Check-in Stasiun (${visits.length})`);
  visits.forEach((v, i) => {
    ensureSpace(doc, 70);
    doc.font('Helvetica-Bold').fontSize(10).text(
      `${i + 1}. ${teamName(v.teams)} — ${stationLabel(v.stations)}`
    );
    doc.font('Helvetica').fontSize(10);
    field(doc, 'Check-in', fmt(v.checked_in_at));
    field(doc, 'Check-out', fmt(v.checked_out_at));
    field(doc, 'Status', v.status);
    divider(doc);
  });

  // 6. Transactions
  doc.addPage();
  sectionTitle(doc, `6. Transaksi EnCoin (${transactions.length})`);
  transactions.forEach((tx, i) => {
    ensureSpace(doc, 70);
    const toTeam = teamById.get(tx.to_team_id)?.name ?? tx.to_team_id;
    const fromTeam = tx.from_team_id ? teamById.get(tx.from_team_id)?.name ?? tx.from_team_id : '—';
    doc.font('Helvetica-Bold').fontSize(10).text(`${i + 1}. ${tx.type.toUpperCase()} · ${tx.amount} EC`);
    doc.font('Helvetica').fontSize(10);
    field(doc, 'Ke tim', toTeam);
    field(doc, 'Dari tim', fromTeam);
    field(doc, 'Catatan', tx.note);
    field(doc, 'Waktu', fmt(tx.created_at));
    divider(doc);
  });

  // 7. Economy events
  doc.addPage();
  sectionTitle(doc, `7. Event Ekonomi Otomatis (${economyEvents.length})`);
  economyEvents.forEach((e, i) => {
    ensureSpace(doc, 60);
    const tName = teamById.get(e.team_id)?.name ?? e.team_id;
    doc.font('Helvetica-Bold').fontSize(10).text(`${i + 1}. ${tName} — ${e.event_code}`);
    doc.font('Helvetica').fontSize(10);
    field(doc, 'Jumlah', `${e.amount} EC`);
    field(doc, 'Pos', e.station_number);
    field(doc, 'Catatan', e.note);
    field(doc, 'Waktu', fmt(e.created_at));
    divider(doc);
  });

  // 8. Pos 6 compete runs
  doc.addPage();
  sectionTitle(doc, `8. Timer Kompetisi Pos 6 (${competeRuns.length})`);
  competeRuns.forEach((r, i) => {
    ensureSpace(doc, 60);
    doc.font('Helvetica-Bold').fontSize(10).text(`${i + 1}. ${teamName(r.teams)}`);
    doc.font('Helvetica').fontSize(10);
    field(doc, 'Mulai', fmt(r.started_at));
    field(doc, 'Selesai', fmt(r.ended_at));
    field(doc, 'Durasi (ms)', r.elapsed_ms);
    divider(doc);
  });

  doc.end();

  await new Promise<void>((resolvePromise, reject) => {
    stream.on('finish', () => resolvePromise());
    stream.on('error', reject);
  });

  console.log(`\nPDF tersimpan: ${outPath}`);
  console.log(
    `Ringkasan: ${registrations.length} registrasi, ${profiles.length} profil, ${teams.length} tim, ${submissions.length} submission`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
