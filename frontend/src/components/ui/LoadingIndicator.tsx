import React from 'react';
import { cn } from '@/utils/cn';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => {
  const sizeStyles = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div className="inline-flex flex-col items-center justify-center gap-2.5">
      <div
        className={cn(
          'rounded-full border-electric-500/20 border-t-electric-500 animate-spin shrink-0',
          sizeStyles[size],
          className
        )}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && <span className="text-xs text-slate-400 font-medium">{label}</span>}
    </div>
  );
};

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-navy-800/80 border border-slate-800/40',
        className
      )}
      {...props}
    />
  );
};

export const SketchScanEffect: React.FC<{ isScanning: boolean }> = ({ isScanning }) => {
  if (!isScanning) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {/* Cyan laser scan bar */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_3px_rgba(6,182,212,0.8)] animate-[scan_2.5s_ease-in-out_infinite]" />
      {/* Subtle scan grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:16px_16px]" />
    </div>
  );
};
