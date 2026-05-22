import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-display uppercase tracking-wide transition-all btn-press disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-accent-green text-text-on-accent hover:brightness-110 border border-border',
        destructive: 'bg-accent-red text-white border border-border',
        outline:
          'border border-border bg-bg-secondary text-text-on-surface shadow-[inset_1px_1px_0_var(--color-win-highlight),inset_-1px_-1px_0_var(--color-win-shadow)]',
        ghost: 'text-text-on-bg hover:bg-bg-tertiary',
      },
      size: {
        default: 'h-11 px-5 text-xs',
        sm: 'h-9 px-3 text-[10px]',
        lg: 'h-12 px-6 text-sm',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
  )
);
Button.displayName = 'Button';
