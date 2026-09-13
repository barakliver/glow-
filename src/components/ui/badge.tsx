import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold leading-4 whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'border-line bg-raised text-muted',
        accent: 'border-accent/40 bg-accent/12 text-accent-ink',
        success: 'border-success/40 bg-success/12 text-success',
        warning: 'border-warning/40 bg-warning/12 text-warning',
        danger: 'border-danger/40 bg-danger/12 text-danger',
        outline: 'border-line bg-transparent text-ink',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { badgeVariants };
