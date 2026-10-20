import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { sanitizeInlineStyles, sanitizeTailwindClasses, safeText } from '@/utils/security';

export const CardElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
  children,
}) => {
  const {
    title,
    subtitle,
    shadow = 'md',
    border = true,
  } = node.props || {};

  const shadowStyles: Record<string, string> = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-xl',
  };

  return (
    <div
      data-component-id={node.id}
      data-node-type="Card"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      style={sanitizeInlineStyles(node.styles?.customStyles)}
      className={cn(
        'w-full bg-slate-900/90 rounded-2xl p-5 text-left transition-all',
        border && 'border border-slate-800/80',
        shadowStyles[shadow] || 'shadow-md',
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950'
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4 pb-3 border-b border-slate-800/60">
          {title && (
            <h4 className="text-sm font-semibold text-slate-100 tracking-tight">
              {safeText(title)}
            </h4>
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{safeText(subtitle)}</p>
          )}
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
};

