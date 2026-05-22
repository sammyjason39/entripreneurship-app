import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EVENT_BOOKLET_PDF } from '@/lib/event-tracks';

export function EventBookletPdf() {
  return (
    <Card className="space-y-3 border-accent-green/40">
      <p className="font-display text-xs text-accent-green">BUKU MATERI RESMI</p>
      <p className="font-body text-sm text-text-secondary">
        Case Study &amp; Innovation Card — baca bersama tim sebelum memilih trek perusahaan.
      </p>
      <a href={EVENT_BOOKLET_PDF} target="_blank" rel="noopener noreferrer">
        <Button type="button" className="w-full">
          BUKA PDF
        </Button>
      </a>
      <iframe
        title="Case Study and Innovation Card"
        src={`${EVENT_BOOKLET_PDF}#view=FitH`}
        className="h-[min(420px,55vh)] w-full rounded border-2 border-border bg-bg-primary"
      />
      <p className="font-body text-[10px] text-text-secondary">
        Jika PDF tidak tampil di HP, tap <strong>BUKA PDF</strong> di atas.
      </p>
    </Card>
  );
}
