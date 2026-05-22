import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-card border border-border bg-bg-secondary px-3 py-2 font-body text-sm text-text-primary placeholder:text-text-secondary focus:border-border-active focus:outline-none',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';
