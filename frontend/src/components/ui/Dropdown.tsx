import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <div onClick={() => setIsOpen(!isOpen)} role="button" tabIndex={0}>
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-1.5 w-48 rounded-xl bg-charcoal-900 border border-slate-700/80 shadow-2xl p-1',
            'animate-fade-in backdrop-blur-xl',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled && item.onClick) {
                  item.onClick();
                  setIsOpen(false);
                }
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left',
                item.danger
                  ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                  : 'text-slate-200 hover:bg-navy-800 hover:text-white',
                item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
              )}
            >
              {item.icon && <span className="w-4 h-4 shrink-0 text-slate-400">{item.icon}</span>}
              <span className="flex-1 truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
