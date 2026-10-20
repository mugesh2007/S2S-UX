import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { sanitizeInlineStyles, sanitizeTailwindClasses, safeText } from '@/utils/security';

export const BadgeElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  const { text = 'Badge', variant = 'info' } = node.props || {};

  const variantStyles: Record<string, string> = {
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border border-red-500/20',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700/60',
  };

  return (
    <span
      data-component-id={node.id}
      data-node-type="Badge"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      style={sanitizeInlineStyles(node.styles?.customStyles)}
      className={cn(
        'inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full select-none',
        variantStyles[variant] || variantStyles.info,
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950'
      )}
    >
      {safeText(text, 'Badge')}
    </span>
  );
};

