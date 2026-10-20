import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { Layers } from 'lucide-react';
import { sanitizeInlineStyles, sanitizeTailwindClasses, safeText } from '@/utils/security';

export const NavbarElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  const {
    title = 'S2S App',
    links = ['Dashboard', 'Projects', 'Analytics'],
    hasUserAvatar = true,
  } = node.props || {};

  return (
    <nav
      data-component-id={node.id}
      data-node-type="Navbar"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      style={sanitizeInlineStyles(node.styles?.customStyles)}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm transition-all',
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950'
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-sm text-white tracking-tight">{safeText(title, 'S2S App')}</span>
      </div>

      <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-slate-300">
        {Array.isArray(links) &&
          links.map((link, idx) => (
            <span key={idx} className="hover:text-white cursor-pointer transition-colors">
              {safeText(link)}
            </span>
          ))}
      </div>

      {hasUserAvatar && (
        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
          U
        </div>
      )}
    </nav>
  );
};

