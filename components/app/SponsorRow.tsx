import type { CSSProperties } from 'react';

type SponsorLogo = {
  src: string;
  alt: string;
  className: string;
  width: number;
  height: number;
  style?: CSSProperties;
};

/** Footer / powered-by row — latest sponsor assets in public/brands */
const sponsors: SponsorLogo[] = [
  {
    src: '/brands/binus-2026.png',
    alt: 'BINUS University 45',
    className: 'h-9 max-h-9 w-auto max-w-[5.5rem] object-contain',
    width: 88,
    height: 36,
  },
  {
    src: '/brands/arei-red.png',
    alt: 'Arei Outdoor Gear',
    className: 'h-8 max-h-8 w-auto max-w-[6rem] object-contain',
    width: 96,
    height: 32,
  },
  {
    src: '/brands/ron88.webp',
    alt: 'RON88',
    className: 'h-8 max-h-8 w-auto max-w-[6rem] object-contain',
    width: 96,
    height: 32,
  },
  {
    src: '/brands/kopiwarga.png',
    alt: 'Kopi Warga',
    className: 'h-9 w-9 shrink-0 rounded-full object-contain',
    width: 36,
    height: 36,
  },
  {
    src: '/brands/mata-air.png',
    alt: 'Mata Air Alami',
    className: 'h-8 max-h-8 w-auto max-w-[5rem] object-contain',
    width: 80,
    height: 32,
  },
];

export function SponsorRow({ label = 'Powered by' }: { label?: string }) {
  return (
    <div className="space-y-2">
      <p className="text-center font-display text-[9px] text-text-secondary">{label}</p>
      <div className="flex flex-wrap items-center justify-center gap-3 opacity-90 sm:gap-4">
        {sponsors.map((s) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.src}
            src={s.src}
            alt={s.alt}
            width={s.width}
            height={s.height}
            className={s.className}
            style={s.style}
          />
        ))}
      </div>
    </div>
  );
}
