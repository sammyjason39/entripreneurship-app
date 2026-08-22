import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createWriteStream } from 'fs';
import PDFDocument from 'pdfkit';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function loadEnv() {
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

export function fmt(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
}

export function fmtPhone(normalized: string | null | undefined): string {
  if (!normalized) return '';
  if (normalized.startsWith('62')) return `0${normalized.slice(2)}`;
  return normalized;
}

export function teamName(teams: unknown): string {
  const raw = teams as { name: string } | { name: string }[] | null;
  return Array.isArray(raw) ? raw[0]?.name ?? '' : raw?.name ?? '';
}

export function profileName(profiles: unknown): string {
  const raw = profiles as { full_name: string } | { full_name: string }[] | null;
  return Array.isArray(raw) ? raw[0]?.full_name ?? '' : raw?.full_name ?? '';
}

export function stationLabel(stations: unknown): string {
  const raw = stations as { number: number; name: string } | { number: number; name: string }[] | null;
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s) return '';
  return `Pos ${s.number} — ${s.name}`;
}

export function stationNumber(stations: unknown): number | '' {
  const raw = stations as { number: number } | { number: number }[] | null;
  const s = Array.isArray(raw) ? raw[0] : raw;
  return s?.number ?? '';
}

export function createServiceClient() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export type SubmissionRow = {
  id: string;
  team_id: string;
  station_id: string;
  submitted_by: string;
  form_data: Record<string, string> | null;
  image_url: string | null;
  status: string;
  rejection_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  teams: unknown;
  stations: unknown;
  profiles: unknown;
};

export type EventData = {
  generatedAt: string;
  registrations: Record<string, unknown>[];
  profiles: Record<string, unknown>[];
  teams: Record<string, unknown>[];
  members: Record<string, unknown>[];
  submissions: SubmissionRow[];
  visits: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  economyEvents: Record<string, unknown>[];
  competeRuns: Record<string, unknown>[];
  stations: { id: string; number: number; name: string }[];
};

export async function fetchAllEventData(sb: SupabaseClient): Promise<EventData> {
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
    sb.from('transactions').select('*').order('created_at'),
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

  return {
    generatedAt: fmt(new Date().toISOString()),
    registrations: registrationsRes.data ?? [],
    profiles: profilesRes.data ?? [],
    teams: teamsRes.data ?? [],
    members: membersRes.data ?? [],
    submissions: (submissionsRes.data ?? []) as SubmissionRow[],
    visits: visitsRes.data ?? [],
    transactions: transactionsRes.data ?? [],
    economyEvents: economyRes.data ?? [],
    competeRuns: competeRes.data ?? [],
    stations: stationsRes.data ?? [],
  };
}

type Doc = InstanceType<typeof PDFDocument>;

function ensureSpace(doc: Doc, needed = 80) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) doc.addPage();
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

export async function writeSubmissionsPdf(
  outPath: string,
  data: Pick<EventData, 'generatedAt' | 'submissions'>
) {
  const { generatedAt, submissions } = data;
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const stream = createWriteStream(outPath);
  doc.pipe(stream);

  doc.fontSize(22).fillColor('#1a365d').text('EnTripreneurship Vol. 2', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(14).fillColor('#000000').text('Submission Stasiun', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Diekspor: ${generatedAt} WIB · ${submissions.length} submission`, { align: 'center' });
  doc.moveDown(1);

  if (submissions.length === 0) {
    paragraph(doc, 'Belum ada submission.');
  }

  submissions.forEach((s, i) => {
    if (i > 0) doc.addPage();
    const tName = teamName(s.teams);
    const stLabel = stationLabel(s.stations);
    const submitter = profileName(s.profiles);

    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1a365d').text(`${i + 1}. ${tName}`);
    doc.fillColor('#000000').fontSize(12).text(stLabel);
    doc.moveDown(0.5);
    doc.fontSize(10);
    field(doc, 'Status', s.status);
    field(doc, 'Dikirim oleh', submitter);
    field(doc, 'Waktu submit', fmt(s.submitted_at));
    field(doc, 'Reviewed at', fmt(s.reviewed_at));
    if (s.rejection_note) field(doc, 'Catatan penolakan', s.rejection_note);
    if (s.image_url) field(doc, 'Gambar', s.image_url);

    const formData = s.form_data;
    const entries = formData
      ? Object.entries(formData).filter(([, v]) => v != null && String(v).trim() !== '')
      : [];

    if (entries.length) {
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').text('Isi form:');
      doc.moveDown(0.2);
      for (const [k, v] of entries) {
        ensureSpace(doc, 50);
        doc.font('Helvetica-Bold').text(`${k}:`, { continued: true });
        doc.font('Helvetica').text(` ${v}`, {
          width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 10,
        });
        doc.moveDown(0.2);
      }
    } else if (s.image_url) {
      field(doc, 'Isi form', '(tidak ada teks — lihat gambar di bawah)');
    } else {
      field(doc, 'Isi form', '(kosong — peserta submit tanpa mengisi teks/gambar)');
    }
    divider(doc);
  });

  doc.end();
  await new Promise<void>((resolvePromise, reject) => {
    stream.on('finish', () => resolvePromise());
    stream.on('error', reject);
  });
}
