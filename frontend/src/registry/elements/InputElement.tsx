import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { sanitizeInlineStyles, sanitizeTailwindClasses, safeText } from '@/utils/security';

export const InputElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
  isInteractive,
}) => {
  const {
    label,
    placeholder = 'Enter value...',
    inputType = 'text',
    disabled = false,
  } = node.props || {};

  return (
    <div
      data-component-id={node.id}
      data-node-type="Input"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      className={cn(
        'w-full text-left space-y-1.5 transition-all',
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 rounded-lg p-1'
      )}
    >
      {label && (
        <label className="block text-xs font-medium text-slate-300">
          {safeText(label)}
        </label>
      )}
      <input
        type={String(inputType)}
        placeholder={safeText(placeholder, 'Enter value...')}
        disabled={disabled}
        readOnly={!isInteractive}
        style={sanitizeInlineStyles(node.styles?.customStyles)}
        className={cn(
          'w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors',
          sanitizeTailwindClasses(node.styles?.tailwindClasses)
        )}
      />
    </div>
  );
};

