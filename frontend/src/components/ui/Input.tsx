import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-300 tracking-wide uppercase"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-navy-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-lg border transition-all duration-200',
              'py-2 px-3.5 outline-none focus:ring-2 focus:ring-electric-500/80 focus:border-electric-500',
              'disabled:opacity-50 disabled:bg-navy-950/60 disabled:cursor-not-allowed',
              leftIcon ? 'pl-9' : 'pl-3.5',
              rightIcon ? 'pr-9' : 'pr-3.5',
              error
                ? 'border-red-500/80 focus:ring-red-500/50 focus:border-red-500'
                : 'border-slate-800 hover:border-slate-700',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
