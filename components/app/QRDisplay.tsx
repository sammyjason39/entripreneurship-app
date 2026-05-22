'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRDisplayProps {
  value: string;
  label?: string;
  expiresIn?: number;
}

export function QRDisplay({ value, label, expiresIn }: QRDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-card border-2 border-border-active bg-white p-4">
        <QRCodeSVG value={value} size={220} level="M" includeMargin />
      </div>
      {label && <p className="font-body text-sm text-text-secondary">{label}</p>}
      {expiresIn !== undefined && expiresIn > 0 && (
        <p className="font-display text-xs text-accent-yellow">
          EXPIRES IN {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, '0')}
        </p>
      )}
    </div>
  );
}
