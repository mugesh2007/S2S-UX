import React from 'react';
import { cn } from '@/utils/cn';
import { Button } from './Button';
import { Layers } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl',
        'border border-dashed border-slate-800 bg-navy-950/40 max-w-md mx-auto',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-navy-900 border border-slate-700/60 flex items-center justify-center text-electric-400 mb-4 shadow-subtle-card">
        {icon || <Layers className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-semibold text-slate-100 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs">{description}</p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3 mt-6">
          {actionLabel && onAction && (
            <Button size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button size="sm" variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
