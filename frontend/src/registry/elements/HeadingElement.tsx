import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { sanitizeInlineStyles, sanitizeTailwindClasses, safeText } from '@/utils/security';

export const HeadingElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  const { text = 'Heading', level = 2, align = 'left' } = node.props || {};

  const levelStyles: Record<number, string> = {
    1: 'text-2xl sm:text-3xl font-extrabold text-white tracking-tight',
    2: 'text-xl sm:text-2xl font-bold text-white tracking-tight',
    3: 'text-lg sm:text-xl font-semibold text-slate-100',
    4: 'text-base font-semibold text-slate-200',
    5: 'text-sm font-semibold text-slate-300',
    6: 'text-xs font-semibold text-slate-400 uppercase tracking-wider',
  };

  const alignStyles: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const Tag = (`h${Math.min(Math.max(Number(level) || 2, 1), 6)}` as keyof JSX.IntrinsicElements);

  return (
    <Tag
      data-component-id={node.id}
      data-node-type="Heading"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      style={sanitizeInlineStyles(node.styles?.customStyles)}
      className={cn(
        levelStyles[Number(level)] || levelStyles[2],
        alignStyles[align] || alignStyles.left,
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 rounded px-1'
      )}
    >
      {safeText(text, 'Heading')}
    </Tag>
  );
};

