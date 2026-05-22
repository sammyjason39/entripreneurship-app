import type { CSSProperties } from 'react';

type SponsorLogo = {
  src: string;
  alt: string;
  className: string;
  width: number;
  height: number;
  style?: CSSProperties;
};

const sponsors: SponsorLogo[] = [
  {
    src: '/brands/arei.webp',
    alt: 'Arei Outdoor Gear',
    className: 'h-8 max-h-8 w-auto max-w-[7rem] object-contain',
    width: 120,
    height: 32,
    style: { height: 32, width: 'auto', objectFit: 'contain' },
  },
  {
    src: '/brands/ron88.webp',
    alt: 'RON88',
    className: 'h-8 max-h-8 w-auto max-w-[7rem] object-contain',
    width: 120,
    height: 32,
    style: { height: 32, width: 'auto', objectFit: 'contain' },
  },
  {
    src: '/brands/Logo-kopiwarga.png',
    alt: 'Kopi Warga',
    className: 'h-9 w-9 shrink-0 rounded-full object-contain',
    width: 36,
    height: 36,
    style: { height: 36, width: 36, objectFit: 'contain' },
  },
];

export function SponsorRow({ label = 'Powered by' }: { label?: string }) {
  return (
    <div className="space-y-2">
      <p className="text-center font-display text-[9px] text-text-secondary">{label}</p>
      <div className="flex items-center justify-center gap-4 opacity-80">
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
