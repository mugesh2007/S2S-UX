import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { sanitizeInlineStyles, sanitizeTailwindClasses, safeText } from '@/utils/security';

export const ButtonElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  const {
    label = 'Button',
    variant = 'primary',
    size = 'md',
    disabled = false,
  } = node.props || {};

  const sizeStyles: Record<string, string> = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md',
    md: 'text-sm px-4 py-2 rounded-lg',
    lg: 'text-base px-5 py-2.5 rounded-xl',
  };

  const variantStyles: Record<string, string> = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
    outline: 'border border-blue-500/50 text-blue-400 hover:bg-blue-500/10',
    danger: 'bg-red-600 hover:bg-red-500 text-white font-medium',
    ghost: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
  };

  return (
    <button
      type="button"
      data-component-id={node.id}
      data-node-type="Button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      style={sanitizeInlineStyles(node.styles?.customStyles)}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all select-none',
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.primary,
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950 scale-[1.01]'
      )}
    >
      {safeText(label, 'Button')}
    </button>
  );
};

