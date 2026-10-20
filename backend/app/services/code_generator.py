import io
import re
import zipfile
from pathlib import PurePosixPath
from typing import Dict, List, Set
from app.schemas.component import UIComponentNode
from app.schemas.interface import InterfaceDocument


def escape_jsx(text: str) -> str:
    """Escapes strings to prevent script, tag, and JSX interpolation injection."""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("{", "&#123;")
        .replace("}", "&#125;")
    )


def sanitize_zip_path(raw_path: str) -> str:
    """
    Prevents directory/path traversal vulnerabilities.
    Rejects or normalizes '..', leading slashes, and Windows drive letters.
    """
    # Remove leading slashes and Windows drive letters
    cleaned = re.sub(r"^[a-zA-Z]:[/\\]", "", raw_path)
    cleaned = cleaned.replace("\\", "/").lstrip("/")

    # Stack-based path normalization to safely neutralize parent traversal
    parts = cleaned.split("/")
    stack: List[str] = []
    for part in parts:
        if not part or part == ".":
            continue
        if part == "..":
            if stack:
                stack.pop()
        else:
            stack.append(part)

    return "/".join(stack)



def node_to_modular_jsx(node: UIComponentNode, depth: int = 2) -> str:
    """
    Recursively renders an AST node using our modular React UI components.
    Guarantees strict schema validation and deterministic code generation.
    """
    indent = "  " * depth
    t = node.type.value if hasattr(node.type, "value") else str(node.type)
    props = node.props or {}
    classes = (node.styles.tailwind_classes if node.styles else "") or ""
    clean_classes = re.sub(r'[<>"\'`{}\\]', '', classes).strip()
    class_prop = f' className="{clean_classes}"' if clean_classes else ""

    if t == "Button":
        label = escape_jsx(props.get("label", "Button"))
        variant = props.get("variant", "primary")
        size = props.get("size", "md")
        return f'{indent}<Button variant="{variant}" size="{size}"{class_prop}>{label}</Button>'

    elif t == "Heading":
        text = escape_jsx(props.get("text", "Heading"))
        level = max(1, min(int(props.get("level", 2)), 6))
        align = props.get("align", "left")
        return f'{indent}<Heading level={{{level}}} align="{align}"{class_prop}>{text}</Heading>'

    elif t == "Text":
        content = escape_jsx(props.get("content", "Text paragraph"))
        variant = props.get("variant", "body")
        return f'{indent}<Text variant="{variant}"{class_prop}>{content}</Text>'

    elif t == "Input":
        label = escape_jsx(props.get("label", ""))
        label_attr = f' label="{label}"' if label else ""
        placeholder = escape_jsx(props.get("placeholder", "Enter value..."))
        input_type = props.get("inputType", "text")
        return f'{indent}<Input type="{input_type}" placeholder="{placeholder}"{label_attr}{class_prop} />'

    elif t == "Badge":
        text = escape_jsx(props.get("text", "Badge"))
        variant = props.get("variant", "info")
        return f'{indent}<Badge variant="{variant}"{class_prop}>{text}</Badge>'

    elif t == "Card":
        title = escape_jsx(props.get("title", ""))
        subtitle = escape_jsx(props.get("subtitle", ""))
        title_attr = f' title="{title}"' if title else ""
        subtitle_attr = f' subtitle="{subtitle}"' if subtitle else ""
        children_jsx = "\n".join(node_to_modular_jsx(c, depth + 1) for c in (node.children or []))
        if children_jsx:
            return f'{indent}<Card{title_attr}{subtitle_attr}{class_prop}>\n{children_jsx}\n{indent}</Card>'
        return f'{indent}<Card{title_attr}{subtitle_attr}{class_prop} />'

    elif t == "Container":
        layout = props.get("layout", "flex-col")
        gap = props.get("gap", "gap-4")
        padding = props.get("padding", "p-4")
        children_jsx = "\n".join(node_to_modular_jsx(c, depth + 1) for c in (node.children or []))
        if children_jsx:
            return f'{indent}<Container layout="{layout}" gap="{gap}" padding="{padding}"{class_prop}>\n{children_jsx}\n{indent}</Container>'
        return f'{indent}<Container layout="{layout}" gap="{gap}" padding="{padding}"{class_prop} />'

    elif t == "Navbar":
        title = escape_jsx(props.get("title", "App"))
        links = props.get("links", [])
        links_str = "[" + ", ".join(f'"{escape_jsx(l)}"' for l in links) + "]"
        return f'{indent}<Navbar title="{title}" links={{{links_str}}}{class_prop} />'

    elif t == "Divider":
        orientation = props.get("orientation", "horizontal")
        thickness = props.get("thickness", "thin")
        return f'{indent}<Divider orientation="{orientation}" thickness="{thickness}"{class_prop} />'

    elif t == "Checkbox":
        label = escape_jsx(props.get("label", "Option"))
        checked = "checked" if props.get("checked", False) else "defaultChecked={false}"
        return f'{indent}<Checkbox label="{label}" {checked}{class_prop} />'

    elif t == "ImagePlaceholder":
        alt = escape_jsx(props.get("alt", "Placeholder Image"))
        aspect = props.get("aspectRatio", "16:9")
        caption = escape_jsx(props.get("caption", ""))
        caption_attr = f' caption="{caption}"' if caption else ""
        return f'{indent}<ImagePlaceholder alt="{alt}" aspectRatio="{aspect}"{caption_attr}{class_prop} />'

    elif t == "Avatar":
        fallback = escape_jsx(props.get("fallback", "U"))
        size = props.get("size", "md")
        return f'{indent}<Avatar fallback="{fallback}" size="{size}"{class_prop} />'

    elif t == "Table":
        headers = props.get("headers", ["Column 1", "Column 2"])
        headers_str = "[" + ", ".join(f'"{escape_jsx(h)}"' for h in headers) + "]"
        rows = props.get("rows", [["Item 1", "Active"]])
        rows_str = "[" + ", ".join("[" + ", ".join(f'"{escape_jsx(c)}"' for c in r) + "]" for r in rows) + "]"
        return f'{indent}<Table headers={{{headers_str}}} rows={{{rows_str}}}{class_prop} />'

    else:
        children_jsx = "\n".join(node_to_modular_jsx(c, depth + 1) for c in (node.children or []))
        if children_jsx:
            return f'{indent}<div{class_prop}>\n{children_jsx}\n{indent}</div>'
        return f'{indent}<div{class_prop} />'


class CodeGeneratorService:
    """Generates standalone React TSX code and full production Vite project ZIP bundles."""

    # Static component templates provided in exported src/components/ui/
    COMPONENT_TEMPLATES: Dict[str, str] = {
        "Button.tsx": '''import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md',
    md: 'text-sm px-4 py-2 rounded-lg',
    lg: 'text-base px-5 py-2.5 rounded-xl',
  };

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
    outline: 'border border-blue-500/50 text-blue-400 hover:bg-blue-500/10',
    danger: 'bg-red-600 hover:bg-red-500 text-white font-medium',
    ghost: 'text-slate-400 hover:text-white hover:bg-slate-800/50',
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
''',
        "Input.tsx": '''import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full text-left space-y-1.5">
      {label && <label className="block text-xs font-medium text-slate-300">{label}</label>}
      <input
        className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors ${className}`}
        {...props}
      />
    </div>
  );
};
''',
        "Card.tsx": '''import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, className = '', children }) => {
  return (
    <div className={`w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-left shadow-md ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4 pb-3 border-b border-slate-800/60">
          {title && <h4 className="text-sm font-semibold text-slate-100">{title}</h4>}
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
};
''',
        "Container.tsx": '''import React from 'react';

export interface ContainerProps {
  layout?: 'flex-col' | 'flex-row' | 'grid-2' | 'grid-3' | 'grid-4';
  gap?: string;
  padding?: string;
  className?: string;
  children?: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  layout = 'flex-col',
  gap = 'gap-4',
  padding = 'p-4',
  className = '',
  children,
}) => {
  const layoutStyles: Record<string, string> = {
    'flex-col': 'flex flex-col',
    'flex-row': 'flex flex-row flex-wrap items-center',
    'grid-2': 'grid grid-cols-1 sm:grid-cols-2',
    'grid-3': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    'grid-4': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`w-full rounded-xl transition-all ${layoutStyles[layout] || 'flex flex-col'} ${gap} ${padding} ${className}`}>
      {children}
    </div>
  );
};
''',
        "Heading.tsx": '''import React from 'react';

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  align?: 'left' | 'center' | 'right';
  className?: string;
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  align = 'left',
  className = '',
  children,
}) => {
  const levelStyles: Record<number, string> = {
    1: 'text-3xl font-extrabold text-white tracking-tight',
    2: 'text-2xl font-bold text-white tracking-tight',
    3: 'text-xl font-semibold text-slate-100',
    4: 'text-base font-semibold text-slate-200',
    5: 'text-sm font-semibold text-slate-300',
    6: 'text-xs font-semibold text-slate-400 uppercase tracking-wider',
  };

  const alignStyles: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const Tag = (`h${Math.min(Math.max(Number(level) || 2, 1), 6)}` as keyof JSX.IntrinsicElements);

  return (
    <Tag className={`${levelStyles[level] || levelStyles[2]} ${alignStyles[align] || 'text-left'} ${className}`}>
      {children}
    </Tag>
  );
};
''',
        "Text.tsx": '''import React from 'react';

export interface TextProps {
  variant?: 'body' | 'caption' | 'lead' | 'code';
  className?: string;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({ variant = 'body', className = '', children }) => {
  const variantStyles = {
    body: 'text-sm text-slate-300 leading-relaxed',
    caption: 'text-xs text-slate-400',
    lead: 'text-base text-slate-200 leading-relaxed',
    code: 'font-mono text-xs text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800',
  };

  return <p className={`${variantStyles[variant] || variantStyles.body} ${className}`}>{children}</p>;
};
''',
        "Badge.tsx": '''import React from 'react';

export interface BadgeProps {
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', className = '', children }) => {
  const variantStyles = {
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border border-red-500/20',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700/60',
  };

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full select-none ${variantStyles[variant] || variantStyles.info} ${className}`}>
      {children}
    </span>
  );
};
''',
        "Avatar.tsx": '''import React from 'react';

export interface AvatarProps {
  src?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, fallback = 'U', size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className={`relative rounded-full overflow-hidden flex items-center justify-center font-semibold bg-slate-800 text-slate-200 border border-slate-700 select-none shrink-0 ${sizeStyles[size]} ${className}`}>
      {src ? <img src={src} alt={fallback} className="w-full h-full object-cover" /> : <span>{fallback.charAt(0).toUpperCase()}</span>}
    </div>
  );
};
''',
        "Checkbox.tsx": '''import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className = '', ...props }) => {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none text-left ${className}`}>
      <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500" {...props} />
      <span className="text-sm text-slate-200">{label}</span>
    </label>
  );
};
''',
        "Divider.tsx": '''import React from 'react';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: 'thin' | 'medium' | 'thick';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ orientation = 'horizontal', thickness = 'thin', className = '' }) => {
  const isVertical = orientation === 'vertical';
  const thicknessStyles = {
    thin: isVertical ? 'w-px' : 'h-px',
    medium: isVertical ? 'w-0.5' : 'h-0.5',
    thick: isVertical ? 'w-1' : 'h-1',
  };

  return (
    <div
      className={`bg-slate-800 transition-all select-none ${isVertical ? 'h-full mx-2 self-stretch' : 'w-full my-3'} ${thicknessStyles[thickness]} ${className}`}
      role="separator"
    />
  );
};
''',
        "ImagePlaceholder.tsx": '''import React from 'react';

export interface ImagePlaceholderProps {
  alt?: string;
  caption?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  className?: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  alt = 'Image placeholder',
  caption,
  aspectRatio = '16:9',
  className = '',
}) => {
  const ratioStyles = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/60 p-4 ${ratioStyles[aspectRatio] || 'min-h-[140px]'} ${className}`}>
      <span className="text-xs text-slate-400 font-medium">{alt}</span>
      {caption && <span className="text-[10px] text-slate-500 mt-0.5">{caption}</span>}
    </div>
  );
};
''',
        "Navbar.tsx": '''import React from 'react';

export interface NavbarProps {
  title?: string;
  links?: string[];
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title = 'App', links = [], className = '' }) => {
  return (
    <nav className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm ${className}`}>
      <span className="font-semibold text-sm text-white tracking-tight">{title}</span>
      <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
        {links.map((link, idx) => (
          <span key={idx} className="hover:text-white cursor-pointer transition-colors">
            {link}
          </span>
        ))}
      </div>
    </nav>
  );
};
''',
        "Table.tsx": '''import React from 'react';

export interface TableProps {
  headers?: string[];
  rows?: string[][];
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers = [], rows = [], className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 ${className}`}>
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-slate-800/60 border-b border-slate-800 text-slate-300 uppercase tracking-wider font-semibold">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3.5 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-300">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-slate-800/30">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3.5 py-2.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
''',
    }

    @staticmethod
    def compile_to_tsx(interface: InterfaceDocument, component_name: str = "GeneratedScreen") -> str:
        clean_name = re.sub(r"[^a-zA-Z0-9]", "", component_name) or "GeneratedScreen"
        body = node_to_modular_jsx(interface, depth=2)

        all_components = [
            "Button",
            "Input",
            "Card",
            "Container",
            "Heading",
            "Text",
            "Badge",
            "Avatar",
            "Checkbox",
            "Divider",
            "ImagePlaceholder",
            "Navbar",
            "Table",
        ]
        used = [c for c in all_components if f"<{c}" in body]
        if not used:
            used = ["Container"]
        imports_block = ",\n  ".join(used)

        return f'''import React from 'react';
import {{
  {imports_block},
}} from './components/ui';

/**
 * Generated by Sketch2Screen AI (S2S ux)
 * Component: {clean_name}
 * Version: {interface.meta.version}
 */
export const {clean_name}: React.FC = () => {{
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col font-sans antialiased">
      <div className="max-w-7xl w-full mx-auto space-y-6">
{body}
      </div>
    </div>
  );
}};

export default {clean_name};
'''

    @classmethod
    def generate_project_zip(
        cls, interface: InterfaceDocument, component_name: str = "GeneratedScreen"
    ) -> bytes:
        """
        Packages a secure, production-ready Vite + React + TypeScript + Tailwind CSS project
        into an in-memory ZIP archive.
        Enforces path traversal protection and strictly excludes secrets or uploaded files.
        """
        clean_name = re.sub(r"[^a-zA-Z0-9]", "", component_name) or "GeneratedScreen"
        component_code = cls.compile_to_tsx(interface, clean_name)

        package_json = '''{
  "name": "sketch2screen-exported-project",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.3",
    "vite": "^5.4.8"
  }
}'''

        tsconfig_json = '''{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}'''

        tsconfig_node_json = '''{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}'''

        vite_config = '''import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});'''

        tailwind_config = '''/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};'''

        postcss_config = '''export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};'''

        index_html = f'''<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{clean_name} — Sketch2Screen AI</title>
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>'''

        index_css = '''@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #020617;
  color: #f8fafc;
}'''

        main_tsx = f'''import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {clean_name} from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <{clean_name} />
  </React.StrictMode>
);'''

        ui_index_tsx = '''export * from './Button';
export * from './Input';
export * from './Card';
export * from './Container';
export * from './Heading';
export * from './Text';
export * from './Badge';
export * from './Avatar';
export * from './Checkbox';
export * from './Divider';
export * from './ImagePlaceholder';
export * from './Navbar';
export * from './Table';
'''

        readme_md = f'''# {clean_name} — Generated by Sketch2Screen AI (S2S ux)

This is a production-ready, fully typed React application with Tailwind CSS and Vite, deterministically compiled from a validated UI AST interface document.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local dev server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Architecture

- **`src/App.tsx`**: Main screen assembly component.
- **`src/components/ui/`**: 13 allowlisted, accessible modular components.
- **`src/index.css`**: Tailwind base and utility styling.
- **`vite.config.ts`**: High-performance bundler configuration.
- Zero arbitrary model-generated JavaScript runtime execution.
'''

        files_to_write: Dict[str, str] = {
            "package.json": package_json,
            "tsconfig.json": tsconfig_json,
            "tsconfig.node.json": tsconfig_node_json,
            "vite.config.ts": vite_config,
            "tailwind.config.js": tailwind_config,
            "postcss.config.js": postcss_config,
            "index.html": index_html,
            "README.md": readme_md,
            "src/index.css": index_css,
            "src/main.tsx": main_tsx,
            "src/App.tsx": component_code,
            "src/components/ui/index.ts": ui_index_tsx,
        }

        # Add all 13 modular UI component templates
        for comp_filename, comp_code in cls.COMPONENT_TEMPLATES.items():
            files_to_write[f"src/components/ui/{comp_filename}"] = comp_code

        # Build in-memory ZIP archive with strict path traversal validation
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as z:
            for filepath, content in files_to_write.items():
                safe_name = sanitize_zip_path(filepath)
                # Security: Strictly disallow empty names, .env, or dotfile credentials
                if not safe_name or ".env" in safe_name or "id_rsa" in safe_name:
                    continue
                z.writestr(safe_name, content)

        zip_buffer.seek(0)
        return zip_buffer.getvalue()


code_generator = CodeGeneratorService()
