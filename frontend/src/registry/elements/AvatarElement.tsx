import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { User } from 'lucide-react';
import { sanitizeInlineStyles, sanitizeTailwindClasses, sanitizeUrl, safeText } from '@/utils/security';

export const AvatarElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  const { fallback = 'U', size = 'md', src } = node.props || {};

  const sizeStyles: Record<string, string> = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const cleanSrc = src ? sanitizeUrl(src, '') : '';

  return (
    <div
      data-component-id={node.id}
      data-node-type="Avatar"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      style={sanitizeInlineStyles(node.styles?.customStyles)}
      className={cn(
        'relative rounded-full overflow-hidden flex items-center justify-center font-semibold bg-slate-800 text-slate-200 border border-slate-700 select-none shrink-0',
        sizeStyles[size] || sizeStyles.md,
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950'
      )}
    >
      {cleanSrc ? (
        <img src={cleanSrc} alt={safeText(fallback, 'Avatar')} className="w-full h-full object-cover" />
      ) : fallback ? (
        <span>{safeText(fallback).charAt(0).toUpperCase() || 'U'}</span>
      ) : (
        <User className="w-4 h-4 text-slate-400" />
      )}
    </div>
  );
};

