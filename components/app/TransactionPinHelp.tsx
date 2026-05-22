import { TRANSACTION_PIN_DESCRIPTION, TRANSACTION_PIN_WARNING } from '@/lib/copy';

export function TransactionPinHelp() {
  return (
    <div className="space-y-2 rounded-card border border-border bg-bg-tertiary/50 p-3">
      <p className="font-body text-sm text-text-primary leading-relaxed">
        {TRANSACTION_PIN_DESCRIPTION}
      </p>
      <p className="font-body text-xs text-accent-yellow">{TRANSACTION_PIN_WARNING}</p>
    </div>
  );
}
