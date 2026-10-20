import React from 'react';
import { RegistryComponentProps } from '../types';
import { cn } from '@/utils/cn';
import { sanitizeInlineStyles, sanitizeTailwindClasses, safeText } from '@/utils/security';

export const TableElement: React.FC<RegistryComponentProps> = ({
  node,
  isSelected,
  onSelect,
}) => {
  const {
    headers = ['Column 1', 'Column 2', 'Status'],
    rows = [
      ['Item Alpha', 'Active', '98%'],
      ['Item Beta', 'Pending', '74%'],
    ],
  } = node.props || {};

  const safeHeaders = Array.isArray(headers) ? headers : ['Column 1', 'Column 2'];
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div
      data-component-id={node.id}
      data-node-type="Table"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      style={sanitizeInlineStyles(node.styles?.customStyles)}
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80',
        sanitizeTailwindClasses(node.styles?.tailwindClasses),
        isSelected && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-950'
      )}
    >
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-slate-800/60 border-b border-slate-800 text-slate-300 uppercase tracking-wider font-semibold">
          <tr>
            {safeHeaders.map((h, i) => (
              <th key={i} className="px-3.5 py-2.5">
                {safeText(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {safeRows.length > 0 ? (
            safeRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/30">
                {Array.isArray(row) &&
                  row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2.5">
                      {safeText(cell)}
                    </td>
                  ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={safeHeaders.length || 1} className="px-4 py-6 text-center text-slate-500 font-mono">
                No data rows in table
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

