import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';
import { sanitizeInlineStyles, sanitizeTailwindClasses, safeText } from '@/utils/security';

export const CheckboxElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  const { label = 'Checkbox option', checked = false } = node.props || {};

  return (
    <div
      data-component-id={node.id}
      data-node-type="Checkbox"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      style={sanitizeInlineStyles(node.styles?.customStyles)}
      className={cn(
        'inline-flex items-center gap-2.5 cursor-pointer select-none text-left',
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 rounded px-1'
      )}
    >
      <div
        className={cn(
          'w-4 h-4 rounded border flex items-center justify-center transition-colors',
          checked
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'border-slate-700 bg-slate-900 text-transparent'
        )}
      >
        <Check className="w-3 h-3 stroke-[3]" />
      </div>
      <span className="text-sm text-slate-200">{safeText(label, 'Checkbox option')}</span>
    </div>
  );
};

