import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { sanitizeInlineStyles, sanitizeTailwindClasses } from '@/utils/security';

export const ContainerElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
  children,
}) => {
  const {
    layout = 'flex-col',
    gap = 'gap-4',
    padding = 'p-4',
  } = node.props || {};

  const layoutStyles: Record<string, string> = {
    'flex-col': 'flex flex-col',
    'flex-row': 'flex flex-row flex-wrap items-center',
    'grid-2': 'grid grid-cols-1 sm:grid-cols-2',
    'grid-3': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    'grid-4': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const hasChildren = React.Children.count(children) > 0;

  return (
    <div
      data-component-id={node.id}
      data-node-type="Container"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      style={sanitizeInlineStyles(node.styles?.customStyles)}
      className={cn(
        'w-full rounded-xl transition-all relative',
        layoutStyles[layout] || 'flex flex-col',
        gap,
        padding,
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && 'ring-2 ring-blue-500/80 bg-blue-500/5'
      )}
    >
      {isSelected && (
        <span className="absolute -top-2.5 left-2 bg-blue-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow z-10 pointer-events-none">
          Container #{node.id.slice(-4)}
        </span>
      )}
      {hasChildren ? (
        children
      ) : (
        <div className="w-full py-6 border-2 border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-500 font-mono flex flex-col items-center justify-center gap-1">
          <span>Empty Container</span>
          <span className="text-[10px] text-slate-600">Select container and click &quot;Insert Component&quot;</span>
        </div>
      )}
    </div>
  );
};

