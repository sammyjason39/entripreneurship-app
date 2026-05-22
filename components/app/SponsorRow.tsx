
const sponsors = [
  { src: '/brands/arei.webp', alt: 'Arei Outdoor Gear' },
  { src: '/brands/ron88.webp', alt: 'RON88' },
  { src: '/brands/kopi-warga.png', alt: 'Kopi Warga' },
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
            width={120}
            height={32}
            className="h-8 max-h-8 w-auto max-w-[7rem] object-contain"
            style={{ height: 32, width: 'auto', objectFit: 'contain' }}
          />
        ))}
      </div>
    </div>
  );
}
