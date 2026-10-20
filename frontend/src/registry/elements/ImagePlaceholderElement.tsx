import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { Image as ImageIcon } from 'lucide-react';
import { sanitizeInlineStyles, sanitizeTailwindClasses, safeText } from '@/utils/security';

export const ImagePlaceholderElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  const { caption, alt = 'Image placeholder', aspectRatio = '16:9' } = node.props || {};

  const ratioStyles: Record<string, string> = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  };

  return (
    <div
      data-component-id={node.id}
      data-node-type="ImagePlaceholder"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      style={sanitizeInlineStyles(node.styles?.customStyles)}
      className={cn(
        'w-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/60 p-4 transition-all',
        ratioStyles[aspectRatio] || 'min-h-[140px]',
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950'
      )}
    >
      <ImageIcon className="w-8 h-8 text-slate-500 mb-1" />
      <span className="text-xs text-slate-400 font-medium">{safeText(alt, 'Image placeholder')}</span>
      {caption && <span className="text-[10px] text-slate-500 mt-0.5">{safeText(caption)}</span>}
    </div>
  );
};

