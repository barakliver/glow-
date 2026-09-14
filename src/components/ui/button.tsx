'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full text-sm font-medium tracking-[-0.01em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.985] select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-primary-foreground hover:bg-accent-pressed active:bg-accent-pressed',
        secondary: 'bg-raised text-ink border border-line hover:border-accent/40 hover:bg-raised/80',
        ghost: 'text-ink hover:bg-raised',
        outline: 'border border-line bg-transparent text-ink hover:bg-raised',
        danger: 'bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25',
        success: 'bg-success/15 text-success border border-success/40 hover:bg-success/25',
        link: 'text-accent-ink underline-offset-4 hover:underline',
      },
      size: {
        /* Every size clears 44px, the smallest thing a thumb should have to find. */
        sm: 'h-10 px-4 text-[13px]',
        md: 'h-12 px-5',
        lg: 'h-14 px-7 text-base',
        icon: 'h-12 w-12 rounded-full',
        'icon-sm': 'h-10 w-10 rounded-full',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, block, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
