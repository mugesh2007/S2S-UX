import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg active:scale-[0.98]';

    const sizeStyles = {
      xs: 'text-xs px-2.5 py-1 gap-1.5 rounded-md',
      sm: 'text-xs px-3 py-1.5 gap-2 rounded-md',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5 rounded-xl',
    };

    const variantStyles = {
      primary:
        'bg-electric-600 hover:bg-electric-500 text-white shadow-sm hover:shadow-glow-sm border border-electric-400/30',
      secondary:
        'bg-navy-800 hover:bg-navy-750 text-slate-200 border border-slate-700/60 hover:border-slate-600 shadow-sm',
      outline:
        'bg-transparent hover:bg-navy-850/80 text-slate-300 hover:text-white border border-slate-700/80 hover:border-electric-500/50',
      ghost:
        'bg-transparent hover:bg-navy-800/60 text-slate-400 hover:text-slate-100 border border-transparent',
      danger:
        'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30',
      gradient:
        'bg-gradient-to-r from-electric-600 to-violet-600 hover:from-electric-500 hover:to-violet-500 text-white shadow-glow-sm hover:shadow-glow-md border border-white/20',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
