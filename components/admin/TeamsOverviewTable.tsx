import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { TeamOverviewRow } from '@/lib/teams-overview';

export function TeamsOverviewTable({
  rows,
  detailHrefPrefix,
}: {
  rows: TeamOverviewRow[];
  detailHrefPrefix?: string;
}) {
  if (rows.length === 0) {
    return (
      <Card>
        <p className="font-body text-sm">Belum ada tim.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((t) => (
        <Card key={t.id} className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              {detailHrefPrefix ? (
                <Link href={`${detailHrefPrefix}/${t.id}`} className="font-display text-sm underline">
                  {t.name}
                </Link>
              ) : (
                <p className="font-display text-sm">{t.name}</p>
              )}
              <p className="font-body text-[10px] text-text-secondary">
                {t.member_count}/4 anggota · {t.balance.toLocaleString('id-ID')} EC
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-[10px] text-accent-green">TREK</p>
              <p className="font-body text-xs font-semibold">{t.company_label}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-[10px]">
            <span>
              <span className="text-text-secondary">Timer: </span>
              <span className="font-display tabular-nums text-accent-yellow">
                {t.race_time_label ?? '—'}
              </span>
              {t.race_finished_at && (
                <span className="ml-1 text-accent-green">(selesai)</span>
              )}
            </span>
          </div>
          <ul className="flex flex-wrap gap-2">
            {t.members.map((m) => (
              <li
                key={m.role}
                className="rounded border border-border/40 px-2 py-0.5 font-body text-[10px]"
              >
                <span className="font-display text-accent-blue">{m.role}</span> {m.name}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
