import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { sanitizeInlineStyles, sanitizeTailwindClasses, safeText } from '@/utils/security';

export const TextElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  const { content = 'Text block', variant = 'body' } = node.props || {};

  const variantStyles: Record<string, string> = {
    body: 'text-sm text-slate-300 leading-relaxed',
    caption: 'text-xs text-slate-400',
    lead: 'text-base text-slate-200 leading-relaxed font-normal',
    code: 'font-mono text-xs text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800',
  };

  return (
    <p
      data-component-id={node.id}
      data-node-type="Text"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      style={sanitizeInlineStyles(node.styles?.customStyles)}
      className={cn(
        variantStyles[variant] || variantStyles.body,
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 rounded px-1'
      )}
    >
      {safeText(content, 'Text block')}
    </p>
  );
};

