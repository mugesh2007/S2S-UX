import React from 'react';
import { cn } from '@/utils/cn';
import { AlertOctagon, RotateCw, HelpCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  technicalDetails?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Processing Interrupted',
  message,
  code,
  onRetry,
  technicalDetails,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-6 sm:p-8 rounded-2xl border border-red-500/25 bg-red-950/10 backdrop-blur-md max-w-lg mx-auto text-left',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-red-200 tracking-tight">{title}</h3>
            {code && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-500/30">
                {code}
              </span>
            )}
          </div>
          <p className="text-xs text-red-300/80 mt-1 leading-relaxed">{message}</p>

          {technicalDetails && (
            <div className="mt-3 p-2.5 rounded-lg bg-navy-950/80 border border-red-500/20 font-mono text-[11px] text-red-400/90 overflow-x-auto">
              <code>{technicalDetails}</code>
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            {onRetry && (
              <Button
                size="sm"
                variant="danger"
                leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                onClick={onRetry}
              >
                Retry Operation
              </Button>
            )}
            <a
              href="#docs"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Diagnostic Guide</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
