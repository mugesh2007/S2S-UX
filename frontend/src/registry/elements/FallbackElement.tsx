import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { AlertTriangle } from 'lucide-react';

export const FallbackElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      data-component-id={node.id}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      className={cn(
        'p-3.5 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-2.5 select-none transition-all',
        isSelected && 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-glow-sm'
      )}
      role="alert"
    >
      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">
            Unsupported Element: &lt;{node.type || 'Undefined'}&gt;
          </span>
          <span className="font-mono text-[10px] text-amber-400/80">ID: {node.id}</span>
        </div>
        <p className="text-[11px] text-amber-200/80 leading-relaxed">
          This component type is not in the approved component allowlist. Select this component to replace or delete it in the inspector.
        </p>
      </div>
    </div>
  );
};

