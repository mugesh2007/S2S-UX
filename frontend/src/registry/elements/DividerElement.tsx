import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { sanitizeInlineStyles, sanitizeTailwindClasses } from '@/utils/security';

export const DividerElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  const { orientation = 'horizontal', thickness = 'thin' } = node.props || {};

  const isVertical = orientation === 'vertical';

  const thicknessStyles: Record<string, string> = {
    thin: isVertical ? 'w-px' : 'h-px',
    medium: isVertical ? 'w-0.5' : 'h-0.5',
    thick: isVertical ? 'w-1' : 'h-1',
  };

  return (
    <div
      data-component-id={node.id}
      data-node-type="Divider"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      style={sanitizeInlineStyles(node.styles?.customStyles)}
      className={cn(
        'bg-slate-800 transition-all select-none',
        isVertical ? 'h-full mx-2 self-stretch' : 'w-full my-3',
        thicknessStyles[thickness] || (isVertical ? 'w-px' : 'h-px'),
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950'
      )}
      role="separator"
      aria-orientation={isVertical ? 'vertical' : 'horizontal'}
    />
  );
};
