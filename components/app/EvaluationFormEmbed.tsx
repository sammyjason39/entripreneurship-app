'use client';

import { EVALUATION_FORM_URL } from '@/lib/event-forms';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function EvaluationFormEmbed() {
  return (
    <div className="flex min-h-[70dvh] flex-col gap-3">
      <iframe
        title="Evaluation Form"
        src={EVALUATION_FORM_URL}
        className="min-h-[65dvh] w-full flex-1 rounded-card border-2 border-border bg-bg-secondary"
        allow="fullscreen"
      />
      <a
        href={EVALUATION_FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: 'outline' }), 'w-full text-center')}
      >
        BUKA FORM DI TAB BARU
      </a>
    </div>
  );
}
