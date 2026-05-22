import Link from 'next/link';
import { CASE_STUDIES, INNOVATION_CARDS } from '@/lib/event-content';
import { ContentCompanyCard } from '@/components/learn/ContentCompanyCard';
import { EventBookletPdf } from '@/components/learn/EventBookletPdf';
import { TrackPicker } from '@/components/learn/TrackPicker';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getContentRouteId } from '@/lib/content';
import { trackLabel } from '@/lib/event-tracks';
import type { CompanySlug } from '@/lib/content-types';

type Props = {
  stationNumber: 1 | 3;
  companyTrack: CompanySlug | null;
  isCeo: boolean;
};

export function StationMaterialsPanel({ stationNumber, companyTrack, isCeo }: Props) {
  if (stationNumber === 1) {
    const trackCase = companyTrack
      ? CASE_STUDIES.find((c) => c.slug === companyTrack)
      : null;

    return (
      <section className="space-y-4">
        <EventBookletPdf />
        <TrackPicker currentTrack={companyTrack} isCeo={isCeo} />

        {trackCase ? (
          <>
            <Card className="border-accent-yellow/50 space-y-2">
              <p className="font-display text-xs text-accent-yellow">CASE STUDY TREK ANDA</p>
              <p className="font-body text-sm text-text-secondary">
                Baca materi lengkap, lalu jawab pertanyaan di submission Pos 1.
              </p>
              <Link href={`/learn/${getContentRouteId('case_study', trackCase.slug)}`}>
                <Button className="w-full text-xs">BUKA {trackCase.company}</Button>
              </Link>
            </Card>
            <ContentCompanyCard item={trackCase} subtitle="Case study · Empathize" />
          </>
        ) : (
          <Card className="space-y-2">
            <p className="font-display text-[10px] text-text-secondary">SEMUA TREK (REFERENSI)</p>
            <p className="font-body text-xs text-text-secondary">
              Setelah CEO memilih trek, hanya case study perusahaan itu yang dipakai tim.
            </p>
            <div className="space-y-3 opacity-80">
              {CASE_STUDIES.map((item) => (
                <ContentCompanyCard key={item.slug} item={item} subtitle="Case study · Empathize" />
              ))}
            </div>
          </Card>
        )}
      </section>
    );
  }

  const trackCard = companyTrack
    ? INNOVATION_CARDS.find((c) => c.slug === companyTrack)
    : null;

  return (
    <section className="space-y-3">
      <Card className="border-accent-blue/50 space-y-2">
        <p className="font-display text-xs text-accent-blue">INNOVATION CARD</p>
        {companyTrack ? (
          <p className="font-body text-sm text-text-secondary">
            Trek tim: <strong className="text-text-primary">{trackLabel(companyTrack)}</strong> —
            gunakan innovation card yang sama dengan case study Pos 1.
          </p>
        ) : (
          <p className="font-body text-sm text-text-secondary">
            Pilih trek di Pos 1 dulu agar innovation card tim tampil di sini.
          </p>
        )}
        {trackCard && (
          <Link href={`/learn/${getContentRouteId('innovation_card', trackCard.slug)}`}>
            <Button className="w-full text-xs">BUKA {trackCard.company}</Button>
          </Link>
        )}
      </Card>
      {trackCard ? (
        <ContentCompanyCard item={trackCard} subtitle="Innovation card · Ideate" />
      ) : (
        <div className="space-y-3">
          {INNOVATION_CARDS.map((item) => (
            <ContentCompanyCard key={item.slug} item={item} subtitle="Innovation card · Ideate" />
          ))}
        </div>
      )}
    </section>
  );
}
