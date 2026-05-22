'use client';

import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme/ThemeProvider';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border border-border bg-bg-secondary px-3 py-2',
        className
      )}
    >
      <div>
        <p className="font-display text-[10px] text-text-on-surface">SETTINGS</p>
        <p className="font-body text-sm text-text-on-surface">Light theme</p>
        <p className="font-body text-[10px] text-text-secondary">
          Windows-style light desktop
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isLight}
        aria-label="Toggle light theme"
        onClick={() => setTheme(isLight ? 'dark' : 'light')}
        className={cn(
          'win98-toggle relative h-7 w-12 shrink-0 border border-border bg-bg-tertiary btn-press',
          isLight && 'win98-toggle-on'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 border border-border bg-bg-secondary transition-transform',
            isLight && 'translate-x-5 bg-accent-green'
          )}
        />
      </button>
    </div>
  );
}
