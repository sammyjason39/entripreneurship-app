'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { PIN_LENGTH } from '@/lib/types';

interface PINInputProps {
  onComplete: (pin: string) => void;
  error?: string;
  disabled?: boolean;
  /** Change this value to clear all boxes (e.g. when switching enter → confirm). */
  resetKey?: string | number;
}

export function PINInput({ onComplete, error, disabled, resetKey = 0 }: PINInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDigits(Array(PIN_LENGTH).fill(''));
    refs.current[0]?.focus();
  }, [resetKey]);

  const tryComplete = (next: string[]) => {
    const pin = next.join('');
    if (pin.length === PIN_LENGTH && next.every((d) => d !== '')) {
      onCompleteRef.current(pin);
    }
  };

  const update = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    if (!digit && value !== '') return;
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < PIN_LENGTH - 1) refs.current[index + 1]?.focus();
    tryComplete(next);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (!pasted) return;
    const next = Array(PIN_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIndex = Math.min(pasted.length, PIN_LENGTH - 1);
    refs.current[focusIndex]?.focus();
    tryComplete(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-2">
        {digits.map((d, i) => (
          <input
            key={`${resetKey}-${i}`}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={d}
            disabled={disabled}
            aria-label={`PIN digit ${i + 1}`}
            className={cn(
              'h-14 w-11 rounded-card border-2 border-border bg-bg-primary text-center font-display text-xl text-accent-green focus:border-border-active focus:outline-none',
              error && 'border-accent-red'
            )}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
          />
        ))}
      </div>
      {error && <p className="text-center text-sm text-accent-red">{error}</p>}
    </div>
  );
}
