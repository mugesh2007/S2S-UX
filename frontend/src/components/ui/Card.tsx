import React from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive' | 'outline';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  noPadding = false,
  children,
  ...props
}) => {
  const variantStyles = {
    default:
      'bg-charcoal-900/90 border border-slate-800/80 shadow-subtle-card rounded-xl backdrop-blur-md',
    glass:
      'bg-navy-900/70 border border-slate-700/40 shadow-subtle-card rounded-xl backdrop-blur-xl',
    interactive:
      'bg-charcoal-900/90 border border-slate-800/80 hover:border-electric-500/40 hover:bg-charcoal-850 shadow-subtle-card hover:shadow-glow-sm rounded-xl transition-all duration-200 cursor-pointer',
    outline:
      'bg-transparent border border-dashed border-slate-800 hover:border-slate-700 rounded-xl',
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        noPadding ? 'p-0' : 'p-5 sm:p-6',
        'relative overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-base font-semibold text-slate-100 tracking-tight', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-xs text-slate-400 mt-0.5', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => <div className={cn('space-y-4', className)} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('flex items-center justify-end pt-4 border-t border-slate-800/60 mt-4 gap-2', className)}
    {...props}
  >
    {children}
  </div>
);
