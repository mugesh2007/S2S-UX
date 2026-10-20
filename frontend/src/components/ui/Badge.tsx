import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'violet' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium rounded-full',
  };

  const variantStyles = {
    primary: 'bg-electric-500/10 text-electric-400 border border-electric-500/25',
    secondary: 'bg-navy-800 text-slate-300 border border-slate-700/60',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/25',
    violet: 'bg-violet-500/10 text-violet-400 border border-violet-500/25',
    neutral: 'bg-slate-800/80 text-slate-400 border border-slate-700/50',
  };

  const dotColors = {
    primary: 'bg-electric-400',
    secondary: 'bg-slate-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    violet: 'bg-violet-400',
    neutral: 'bg-slate-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center tracking-wide uppercase',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};
