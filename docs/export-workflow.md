# React Export Workflow & Security Architecture

This document specifies the technical architecture, security enforcement, deterministic templating rules, and operational boundaries of the React code export engine in **Sketch2Screen AI (S2S ux)**.

---

## 1. Export Workflow Architecture

```mermaid
flowchart TD
    A[Validated AST Interface Document] --> B[AST Pre-Sanitization & Normalization]
    B --> C[Deterministic Code Generator]
    C --> D1[src/App.tsx Component Assembly]
    C --> D2[13 Modular UI Components in src/components/ui/]
    C --> D3[Vite + TypeScript + Tailwind Build Configs]
    D1 & D2 & D3 --> E[Security Sanitizer: sanitize_zip_path]
    E --> F[In-Memory ZIP Packaging (io.BytesIO)]
    F --> G[Secure Binary Stream Download]
```

### 1.1 Pure Deterministic Templating
- **Zero Arbitrary Executable AI Code**: The AI model is **never** asked or permitted to generate executable JavaScript or TypeScript files.
- The backend parses the validated, schema-constrained `InterfaceDocument` Pydantic model (`backend/app/schemas/interface.py`).
- Deterministic python templating functions (`code_generator.py`) map component types, props, and sanitized Tailwind classes to typed React components.

### 1.2 Modular Component Scaffolding
The exported Vite project does not generate a single unwieldy monolithic file. Instead, it produces:
1. `src/App.tsx`: The primary interface screen composing modular components.
2. `src/components/ui/`: 13 isolated, accessible UI component files:
   - `Button.tsx`: Accessible interactive buttons with 5 variants (`primary`, `secondary`, `outline`, `danger`, `ghost`) and 3 sizes (`sm`, `md`, `lg`).
   - `Input.tsx`: Form inputs with labels and dark-mode styling.
   - `Card.tsx`: Structural container cards with header titles, subtitles, and child slots.
   - `Container.tsx`: Responsive flex and grid containers (`flex-col`, `flex-row`, `grid-2`, `grid-3`).
   - `Heading.tsx`: Accessible headings `H1`–`H6` with alignment options.
   - `Text.tsx`: Body copy, captions, and muted descriptions.
   - `Badge.tsx`: Status tags (`info`, `success`, `warning`, `error`, `neutral`).
   - `Avatar.tsx`: Profile avatar placeholders with initials fallback.
   - `Checkbox.tsx`: Controlled form checkboxes with active checked states.
   - `ImagePlaceholder.tsx`: Aspect-ratio-constrained visual placeholders (`16:9`, `4:3`, `1:1`).
   - `Navbar.tsx`: Responsive navigation bar with application title and route links.
   - `Divider.tsx`: Structural separation lines (`horizontal`, `vertical`).
   - `Table.tsx`: Tabular data presentation with column headers and striped rows.
   - `index.ts`: Unified barrel export.

---

## 2. Security Safeguards

Security is enforced at every tier of export packaging:

| Security Vector | Defense Mechanism | Implementation Location |
| :--- | :--- | :--- |
| **Path Traversal** | Rejects `..`, leading slashes, and Windows drive letters via stack-based path normalization | `backend/app/services/code_generator.py::sanitize_zip_path` |
| **Secrets Exclusion** | Disallows writing `.env`, `.env.*`, `id_rsa`, or dotfile credentials | `backend/app/services/code_generator.py` line 730 |
| **Raw Image Isolation** | Raw user uploads and sketch binary files are never bundled into the code ZIP | In-memory ZIP buffer writes only vetted source files |
| **Script Injection (XSS)** | `escape_jsx` converts `<`, `>`, `&`, `{`, `}` into safe XML entities | `code_generator.py::escape_jsx` |
| **CSS Injection** | Tailwind tokens are sanitized to strip HTML tags, quotes, backticks, and semicolons | `code_generator.py::node_to_modular_jsx` |
| **Filesystem Safety** | In-memory `io.BytesIO` compression avoids writing temporary files to server disks | Completely memory-resident |

---

## 3. Exported Project Anatomy

```
my-screen-project.zip
├── package.json               # React 18, Vite 5, Tailwind CSS 3, Lucide React
├── tsconfig.json              # TypeScript strict configuration
├── tsconfig.node.json         # Vite node environment config
├── vite.config.ts             # Vite bundler configuration
├── tailwind.config.js         # Tailwind content scanning & theme configuration
├── postcss.config.js          # Autoprefixer & Tailwind PostCSS plugins
├── index.html                 # Single-page application entry point
├── README.md                  # Quickstart, architecture, and build documentation
└── src/
    ├── main.tsx               # ReactDOM entry point
    ├── index.css              # Tailwind base, components, and utilities
    ├── App.tsx                # Synthesized Screen Component
    └── components/
        └── ui/
            ├── Button.tsx
            ├── Input.tsx
            ├── Card.tsx
            ├── Container.tsx
            ├── Heading.tsx
            ├── Text.tsx
            ├── Badge.tsx
            ├── Avatar.tsx
            ├── Checkbox.tsx
            ├── Divider.tsx
            ├── ImagePlaceholder.tsx
            ├── Navbar.tsx
            ├── Table.tsx
            └── index.ts
```

---

## 4. Operational Boundaries and Limitations

1. **Static UI Presentation**:
   - The exported application produces a fully functional, styled visual interface.
   - It does not automatically scaffold arbitrary remote REST/GraphQL backend API endpoints, authentication providers, or persistent database mutations.
2. **Component Vocabulary**:
   - The deterministic generator supports 13 core UI component primitives.
   - Custom third-party visualization components (e.g., complex WebGL charts, rich text editors) are rendered via container placeholders and should be wired manually post-export.
3. **Responsive Media Queries**:
   - Layouts default to responsive Tailwind utility classes (`flex-col md:flex-row`, `grid-cols-1 md:grid-cols-3`).
   - Deeply custom breakpoint logic beyond standard Tailwind breakpoints (`sm`, `md`, `lg`, `xl`) should be customized in `src/App.tsx`.
4. **Behavioral Code**:
   - By design and security policy, model-generated arbitrary runtime functions (`eval()`, inline script tags) are forbidden.
   - Interactive state hooks (`useState`) are provided for standard primitives (form inputs, checkboxes, buttons); advanced application state machines should be integrated by developers in `src/App.tsx`.
