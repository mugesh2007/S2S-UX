import React from 'react';
import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pill' | 'underline' | 'boxed';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  className,
}) => {
  if (variant === 'underline') {
    return (
      <div className={cn('flex items-center gap-6 border-b border-slate-800', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative pb-3 text-xs font-semibold tracking-wide flex items-center gap-2 transition-colors',
                isActive ? 'text-electric-400' : 'text-slate-400 hover:text-slate-200',
                tab.disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                    isActive ? 'bg-electric-500/20 text-electric-300' : 'bg-slate-800 text-slate-400'
                  )}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-electric-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center p-1 rounded-xl bg-charcoal-900/90 border border-slate-800/80 gap-1',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
              isActive
                ? 'bg-navy-800 text-white shadow-sm border border-slate-700/60 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850/40',
              tab.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {tab.icon && <span className="w-3.5 h-3.5 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                  isActive ? 'bg-electric-500/20 text-electric-300' : 'bg-slate-800 text-slate-400'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
