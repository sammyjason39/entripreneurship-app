/**
 * Export event data to Excel + submissions to PDF.
 *
 * Usage:
 *   npx tsx scripts/export-all-data-xlsx.ts
 *   npx tsx scripts/export-all-data-xlsx.ts --dir exports
 *
 * Output:
 *   exports/entripreneurship-data-YYYY-MM-DD.xlsx
 *   exports/entripreneurship-submissions-YYYY-MM-DD.pdf
 */

import { mkdirSync } from 'fs';
import { resolve } from 'path';
import ExcelJS from 'exceljs';
import {
  createServiceClient,
  fetchAllEventData,
  fmt,
  fmtPhone,
  profileName,
  stationLabel,
  stationNumber,
  teamName,
  writeSubmissionsPdf,
} from './lib/export-data';

function cellVal(v: unknown): string | number | boolean {
  if (v == null) return '';
  if (typeof v === 'boolean' || typeof v === 'number') return v;
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function addSheet(
  wb: ExcelJS.Workbook,
  name: string,
  headers: string[],
  rows: unknown[][]
) {
  const sheet = wb.addWorksheet(name.slice(0, 31));
  sheet.addRow(headers);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A365D' },
  };
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

  for (const row of rows) {
    sheet.addRow(row.map(cellVal));
  }

  sheet.columns.forEach((col) => {
    let max = 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.value ?? '').length;
      if (len > max) max = Math.min(len, 60);
    });
    col.width = max + 2;
  });

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  return sheet;
}

async function main() {
  const dirArg = process.argv.indexOf('--dir');
  const date = new Date().toISOString().slice(0, 10);
  const outDir = resolve(process.cwd(), dirArg >= 0 ? process.argv[dirArg + 1]! : 'exports');
  mkdirSync(outDir, { recursive: true });

  const xlsxPath = resolve(outDir, `entripreneurship-data-${date}.xlsx`);
  const pdfPath = resolve(outDir, `entripreneurship-submissions-${date}.pdf`);

  const sb = createServiceClient();
  const data = await fetchAllEventData(sb);

  const teamById = new Map(data.teams.map((t) => [t.id as string, t]));
  const profileById = new Map(data.profiles.map((p) => [p.id as string, p]));

  const wb = new ExcelJS.Workbook();
  wb.creator = 'EnTripreneurship Export';
  wb.created = new Date();

  addSheet(wb, 'Ringkasan', ['Item', 'Jumlah', 'Diekspor'], [
    ['Registrasi peserta', data.registrations.length, data.generatedAt],
    ['Profil app (participant)', data.profiles.length, ''],
    ['Tim', data.teams.length, ''],
    ['Anggota tim', data.members.length, ''],
    ['Submission (detail di PDF)', data.submissions.length, pdfPath.split('/').pop()],
    ['Check-in stasiun', data.visits.length, ''],
    ['Transaksi EnCoin', data.transactions.length, ''],
    ['Event ekonomi', data.economyEvents.length, ''],
    ['Timer Pos 6', data.competeRuns.length, ''],
  ]);

  addSheet(
    wb,
    'Registrasi',
    [
      'Nama',
      'WhatsApp',
      'NIM',
      'Program Studi',
      'Email',
      'Email Form',
      'Komitmen Hadir',
      'Minat',
      'Sumber Info',
      'Referral',
      'User Terhubung',
      'Linked At',
      'Dibuat',
    ],
    data.registrations.map((r) => [
      r.full_name,
      fmtPhone(r.whatsapp_normalized as string),
      r.student_id,
      r.study_program,
      r.email,
      r.form_email,
      r.commit_attendance,
      r.interests,
      r.info_source,
      r.referral_name,
      r.user_id ? 'Ya' : 'Belum',
      fmt(r.linked_at as string),
      fmt(r.created_at as string),
    ])
  );

  addSheet(
    wb,
    'Profil App',
    ['Nama', 'ID', 'NIM', 'WhatsApp', 'Onboarding', 'QR Token', 'Dibuat'],
    data.profiles.map((p) => [
      p.full_name,
      p.id,
      p.student_id,
      fmtPhone(p.whatsapp_normalized as string),
      p.onboarding_complete ? 'Ya' : 'Tidak',
      p.qr_token,
      fmt(p.created_at as string),
    ])
  );

  addSheet(
    wb,
    'Tim',
    [
      'Nama Tim',
      'Join Code',
      'Saldo EC',
      'Company Track',
      'Business Idea',
      'Skor Inovasi',
      'Skor Outfit',
      'Race Start',
      'Race Finish',
      'CEO',
      'Dibuat',
    ],
    data.teams.map((t) => {
      const ceo = profileById.get(t.ceo_id as string);
      return [
        t.name,
        t.join_code,
        t.balance,
        t.company_track,
        t.business_idea,
        t.innovative_score,
        t.outfit_score,
        fmt(t.race_started_at as string),
        fmt(t.race_finished_at as string),
        ceo?.full_name ?? t.ceo_id,
        fmt(t.created_at as string),
      ];
    })
  );

  addSheet(
    wb,
    'Anggota Tim',
    ['Tim', 'Peran', 'Nama', 'NIM', 'WhatsApp', 'Join At'],
    data.members.map((m) => {
      const prof = m.profiles as { full_name?: string; student_id?: string; whatsapp_normalized?: string } | null;
      const team = teamById.get(m.team_id as string);
      return [
        team?.name ?? m.team_id,
        m.team_role,
        prof?.full_name ?? '',
        prof?.student_id ?? '',
        fmtPhone(prof?.whatsapp_normalized),
        fmt(m.joined_at as string),
      ];
    })
  );

  addSheet(
    wb,
    'Index Submission',
    [
      'No',
      'Tim',
      'Pos',
      'Stasiun',
      'Status',
      'Dikirim Oleh',
      'Ringkasan',
      'Waktu Submit',
      'Reviewed At',
      'Ada Gambar',
      'Catatan',
      'Detail',
    ],
    data.submissions.map((s, i) => {
      const summary =
        s.form_data && typeof s.form_data.summary === 'string' ? s.form_data.summary.trim() : '';
      const extra = s.form_data
        ? Object.entries(s.form_data)
            .filter(([k, v]) => k !== 'summary' && v != null && String(v).trim())
            .map(([k, v]) => `${k}: ${v}`)
            .join('; ')
        : '';
      const ringkasan = summary || extra || '(kosong)';
      return [
        i + 1,
        teamName(s.teams),
        stationNumber(s.stations),
        stationLabel(s.stations),
        s.status,
        profileName(s.profiles),
        ringkasan,
        fmt(s.submitted_at),
        fmt(s.reviewed_at),
        s.image_url ? 'Ya' : 'Tidak',
        s.rejection_note,
        'Lihat file PDF submissions',
      ];
    })
  );

  addSheet(
    wb,
    'Check-in Stasiun',
    ['Tim', 'Pos', 'Stasiun', 'Check-in', 'Check-out', 'Status'],
    data.visits.map((v) => [
      teamName(v.teams),
      stationNumber(v.stations),
      stationLabel(v.stations),
      fmt(v.checked_in_at as string),
      fmt(v.checked_out_at as string),
      v.status,
    ])
  );

  addSheet(
    wb,
    'Transaksi',
    ['Tipe', 'Jumlah EC', 'Ke Tim', 'Dari Tim', 'Catatan', 'Waktu'],
    data.transactions.map((tx) => [
      tx.type,
      tx.amount,
      teamById.get(tx.to_team_id as string)?.name ?? tx.to_team_id,
      tx.from_team_id ? teamById.get(tx.from_team_id as string)?.name ?? tx.from_team_id : '',
      tx.note,
      fmt(tx.created_at as string),
    ])
  );

  addSheet(
    wb,
    'Event Ekonomi',
    ['Tim', 'Event Code', 'Pos', 'Jumlah EC', 'Catatan', 'Waktu'],
    data.economyEvents.map((e) => [
      teamById.get(e.team_id as string)?.name ?? e.team_id,
      e.event_code,
      e.station_number,
      e.amount,
      e.note,
      fmt(e.created_at as string),
    ])
  );

  addSheet(
    wb,
    'Timer Pos 6',
    ['Tim', 'Mulai', 'Selesai', 'Durasi (ms)', 'Durasi (detik)'],
    data.competeRuns.map((r) => [
      teamName(r.teams),
      fmt(r.started_at as string),
      fmt(r.ended_at as string),
      r.elapsed_ms,
      r.elapsed_ms != null ? Math.floor(Number(r.elapsed_ms) / 1000) : '',
    ])
  );

  await wb.xlsx.writeFile(xlsxPath);
  await writeSubmissionsPdf(pdfPath, {
    generatedAt: data.generatedAt,
    submissions: data.submissions,
  });

  console.log(`\nExcel: ${xlsxPath}`);
  console.log(`PDF submissions (${data.submissions.length}): ${pdfPath}`);
  console.log(
    `Ringkasan: ${data.registrations.length} registrasi, ${data.profiles.length} profil, ${data.teams.length} tim`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
