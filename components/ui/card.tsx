import { cn } from '@/lib/utils';

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-bg-secondary p-4 relative text-text-on-surface',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
