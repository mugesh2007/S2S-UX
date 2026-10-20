import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  delay = 150,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  const show = () => {
    const timeout = window.setTimeout(() => setIsVisible(true), delay);
    setTimer(timeout);
  };

  const hide = () => {
    if (timer) clearTimeout(timer);
    setIsVisible(false);
  };

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap px-2.5 py-1 text-xs font-medium text-slate-200',
            'bg-charcoal-900 border border-slate-700/80 rounded-md shadow-lg pointer-events-none',
            'animate-fade-in',
            positionStyles[position]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
