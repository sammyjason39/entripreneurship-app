'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { PIN_LENGTH } from '@/lib/types';

interface PINInputProps {
  onComplete: (pin: string) => void;
  error?: string;
  disabled?: boolean;
}

export function PINInput({ onComplete, error, disabled }: PINInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < PIN_LENGTH - 1) refs.current[index + 1]?.focus();
    const pin = next.join('');
    if (pin.length === PIN_LENGTH && !next.includes('')) onComplete(pin);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={d}
            disabled={disabled}
            className={cn(
              'h-14 w-11 rounded-card border-2 border-border bg-bg-primary text-center font-display text-xl text-accent-green focus:border-border-active focus:outline-none',
              error && 'border-accent-red'
            )}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
          />
        ))}
      </div>
      {error && <p className="text-center text-sm text-accent-red">{error}</p>}
    </div>
  );
}
