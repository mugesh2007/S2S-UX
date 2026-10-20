import { S2SNode, S2SNodeTree } from '@/types/ast';

/**
 * Escapes characters for safe inclusion in JSX string output.
 */
function escapeJSXText(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Compiles a single AST node into JSX code representation.
 */
function nodeToJSX(node: S2SNode, depth: number = 2): string {
  const indent = '  '.repeat(depth);
  const { type, props = {}, styles = {}, children = [] } = node;
  const classes = styles.tailwindClasses || '';

  switch (type) {
    case 'Button': {
      const { label = 'Button', variant = 'primary', size = 'md' } = props;
      const variantClass =
        variant === 'primary'
          ? 'bg-blue-600 hover:bg-blue-500 text-white'
          : variant === 'secondary'
          ? 'bg-slate-800 text-slate-100 border border-slate-700'
          : 'border border-blue-500/50 text-blue-400';
      const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
      return `${indent}<button className="inline-flex items-center justify-center font-medium rounded-lg transition-colors ${sizeClass} ${variantClass} ${classes}">\n${indent}  ${escapeJSXText(
        String(label)
      )}\n${indent}</button>`;
    }

    case 'Heading': {
      const { text = 'Heading', level = 2 } = props;
      const Tag = `h${Math.min(Math.max(Number(level) || 2, 1), 6)}`;
      const sizeClass =
        level === 1 ? 'text-3xl font-extrabold' : level === 2 ? 'text-2xl font-bold' : 'text-xl font-semibold';
      return `${indent}<${Tag} className="${sizeClass} text-white tracking-tight ${classes}">\n${indent}  ${escapeJSXText(
        String(text)
      )}\n${indent}</${Tag}>`;
    }

    case 'Text': {
      const { content = 'Text' } = props;
      return `${indent}<p className="text-sm text-slate-300 leading-relaxed ${classes}">\n${indent}  ${escapeJSXText(
        String(content)
      )}\n${indent}</p>`;
    }

    case 'Input': {
      const { label, placeholder = 'Enter value...', inputType = 'text' } = props;
      return `${indent}<div className="space-y-1.5 w-full">\n${
        label
          ? `${indent}  <label className="block text-xs font-medium text-slate-300">${escapeJSXText(
              String(label)
            )}</label>\n`
          : ''
      }${indent}  <input type="${inputType}" placeholder="${escapeJSXText(
        String(placeholder)
      )}" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 ${classes}" />\n${indent}</div>`;
    }

    case 'Badge': {
      const { text = 'Badge', variant = 'info' } = props;
      const variantClass =
        variant === 'success'
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : variant === 'warning'
          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      return `${indent}<span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium ${variantClass} ${classes}">${escapeJSXText(
        String(text)
      )}</span>`;
    }

    case 'Card': {
      const { title, subtitle } = props;
      const childJSX = children.map((c) => nodeToJSX(c, depth + 1)).join('\n');
      return `${indent}<div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md ${classes}">\n${
        title || subtitle
          ? `${indent}  <div className="mb-4 pb-3 border-b border-slate-800/60">\n${
              title
                ? `${indent}    <h4 className="text-sm font-semibold text-slate-100">${escapeJSXText(
                    String(title)
                  )}</h4>\n`
                : ''
            }${
              subtitle
                ? `${indent}    <p className="text-xs text-slate-400 mt-0.5">${escapeJSXText(
                    String(subtitle)
                  )}</p>\n`
                : ''
            }${indent}  </div>\n`
          : ''
      }${childJSX ? `${childJSX}\n` : ''}${indent}</div>`;
    }

    case 'Container': {
      const { layout = 'flex-col', gap = 'gap-4', padding = 'p-4' } = props;
      const layoutClass =
        layout === 'grid-3'
          ? 'grid grid-cols-1 md:grid-cols-3'
          : layout === 'grid-2'
          ? 'grid grid-cols-1 md:grid-cols-2'
          : layout === 'flex-row'
          ? 'flex flex-row items-center'
          : 'flex flex-col';
      const childJSX = children.map((c) => nodeToJSX(c, depth + 1)).join('\n');
      return `${indent}<div className="${layoutClass} ${gap} ${padding} ${classes}">\n${
        childJSX ? `${childJSX}\n` : ''
      }${indent}</div>`;
    }

    case 'Navbar': {
      const { title = 'Application', links = [] } = props;
      const linksJSX = Array.isArray(links)
        ? links
            .map(
              (l) =>
                `${indent}    <span className="text-slate-300 hover:text-white cursor-pointer transition-colors">${escapeJSXText(
                  String(l)
                )}</span>`
            )
            .join('\n')
        : '';
      return `${indent}<nav className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 ${classes}">\n${indent}  <div className="font-semibold text-sm text-white">${escapeJSXText(
        String(title)
      )}</div>\n${indent}  <div className="flex items-center gap-4 text-xs font-medium">\n${linksJSX}\n${indent}  </div>\n${indent}</nav>`;
    }

    default: {
      const childJSX = children.map((c) => nodeToJSX(c, depth + 1)).join('\n');
      return `${indent}<div className="p-4 rounded-lg bg-slate-900/60 ${classes}">\n${
        childJSX ? `${childJSX}\n` : ''
      }${indent}</div>`;
    }
  }
}

/**
 * Compiles the entire S2S UI AST into a complete, standalone React TypeScript component.
 */
export function compileASTtoReactTSX(ast: S2SNodeTree): string {
  const rootContent = nodeToJSX(ast, 2);
  const componentName = ast.meta?.title
    ? ast.meta.title.replace(/[^a-zA-Z0-9]/g, '')
    : 'GeneratedScreen';

  return `import React from 'react';

/**
 * Generated by Sketch2Screen AI (S2S ux)
 * Source: Hand-drawn sketch converted to validated React AST
 * Created: ${ast.meta?.createdAt || new Date().toISOString()}
 */
export const ${componentName}: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col font-sans antialiased">
      <div className="max-w-7xl w-full mx-auto space-y-6">
${rootContent}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
