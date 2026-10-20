# Sketch2Screen AI (S2S ux)

> **Autonomous Vision-to-Interface Synthesis Engine**  
> Transform hand-drawn UI sketches, whiteboard wireframes, and annotated paper blueprints into production-ready, editable React + TypeScript + Tailwind CSS interfaces with rigorous mathematical fidelity verification and secure code exports.

---

## 1. Project Overview

**Sketch2Screen AI (S2S ux)** is a developer-centric full-stack platform designed to eliminate the friction between initial product ideation and frontend implementation. By bridging computer vision (OpenCV) and multimodal Vision-Language Models (VLMs) with a strictly sandboxed component runtime, Sketch2Screen AI converts physical drawings into interactive, editable, and standalone buildable React applications.

---

## 2. Problem Statement

Modern software teams almost universally conceptualize user interfaces on whiteboards, notebooks, and tablet sketches. However:
1. **Manual Markup Drag:** Translating a hand-drawn sketch into code requires hours of repetitive layout setup, CSS styling, and component scaffolding.
2. **Generative AI Hallucinations:** Traditional generative AI tools often output freeform, unstructured code with missing dependencies, broken imports, or unsafe runtime scripts (`eval()`, inline event handlers).
3. **No Grounded Verification:** Existing screenshot-to-code experiments generate code without verifying whether the output actually preserves the spatial layout, element hierarchy, and annotations of the original sketch.
4. **Fragile Edits:** Modifying a single generated button color often requires regenerating the entire page from scratch, discarding previous manual adjustments.

---

## 3. Proposed Solution

Sketch2Screen AI introduces a **Structured Abstract Syntax Tree (AST)** pipeline:
- **Vision Ingestion:** High-contrast OpenCV preprocessing segments visual contours from pencil or marker drawings.
- **Constrained Interpretation:** A Vision-Language Model maps layout geometry and handwritten annotations into a strict Pydantic v2 AST schema.
- **Zero-Eval Sandbox:** The frontend renders interfaces solely through an allowlisted component registry—eliminating arbitrary JavaScript execution.
- **Quantitative Fidelity Verification:** A deterministic checker compares sketch contours to the generated UI across **7 distinct vision dimensions**, pinpointing layout drift and enabling one-click non-destructive corrections.
- **Turnkey Build Export:** An AST-to-React compiler exports standalone TSX files or full Vite + React + Tailwind CSS project bundles (ZIP) that compile cleanly in isolated environments.

---

## 4. Main Innovations

1. **Sandboxed AST Compilation (Zero Code Injection):**
   Unlike LLMs that output raw string templates prone to syntax errors and XSS, Sketch2Screen AI outputs a type-safe JSON AST. The frontend maps AST nodes directly to pre-compiled React primitives. Arbitrary execution (`eval()`, `new Function()`, `dangerouslySetInnerHTML`) is architecturally blocked.

2. **Deterministic 7-Dimension Sketch Fidelity Checker:**
   Replaces subjective accuracy scores with algorithmic evaluation across:
   - *Component Presence* (missing or extra elements)
   - *Spatial Ordering* (reading flow sequence)
   - *Relative Position* (centroid displacement)
   - *Component Dimensions* (bounding box aspect ratio & area)
   - *Text Consistency* (label accuracy)
   - *Layout Structure* (flex container hierarchy)
   - *Annotation Adherence* (handwritten notes compliance)

3. **Targeted, Non-Destructive In-Place Corrections:**
   Enables component-level editing and natural-language commands (e.g. *"Make the login button blue and full width"*) by mutating only the targeted AST node, avoiding destructive full-page regeneration.

4. **Hardened Traversal-Proof Exporter:**
   Generates a standalone Vite + React 18 + TypeScript + Tailwind CSS project with stack-based path sanitization preventing directory traversal escapes (`../`).

---

## 5. System Architecture

```
                    ┌───────────────────────────────────┐
                    │      Hand-Drawn Sketch / PNG      │
                    └─────────────────┬─────────────────┘
                                      │
                         [CV Preprocessor & Pillow]
                                      │
                    ┌─────────────────▼─────────────────┐
                    │  Provider Abstraction (VLM / AI)  │
                    │  (Gemini / Claude / Offline Mock) │
                    └─────────────────┬─────────────────┘
                                      │ Structured AST JSON
                    ┌─────────────────▼─────────────────┐
                    │    Pydantic Schema Validation     │
                    └──────┬─────────────────────┬──────┘
                           │                     │
            ┌──────────────▼──────┐       ┌──────▼──────────────┐
            │   Fidelity Engine   │       │ Visual React Canvas │
            │ (7 Vision Metrics)  │       │ (Allowlisted Types) │
            └──────────────┬──────┘       └──────┬──────────────┘
                           │                     │
                    ┌──────▼─────────────────────▼──────┐
                    │     Targeted AST Corrections      │
                    └─────────────────┬─────────────────┘
                                      │
                    ┌─────────────────▼─────────────────┐
                    │  Isolated SQLite Project Vault    │
                    └─────────────────┬─────────────────┘
                                      │
                    ┌─────────────────▼─────────────────┐
                    │ Modular React + Vite ZIP Exporter │
                    └───────────────────────────────────┘
```

---

## 6. Technology Stack

### Frontend Architecture
- **Framework:** React 18 with TypeScript 5
- **Tooling:** Vite 5 (Bundler & Dev Server)
- **Styling:** Tailwind CSS 3 with curated dark theme tokens
- **Motion:** Framer Motion (restrained layout animations)
- **Icons:** Lucide React
- **State Management:** Zustand (AST tree store with undo/redo history)
- **Testing:** Playwright (End-to-End browser automation) & Node.js Test Runner + esbuild (Unit)

### Backend Architecture
- **Framework:** FastAPI (Python 3.12, async REST)
- **Validation:** Pydantic v2 (Strict AST models, bounded recursion)
- **Computer Vision:** OpenCV (cv2) with CLAHE & Pillow (PIL) fallback
- **Storage:** SQLite transactional repository (`SQLiteProjectRepository`)
- **Server:** Uvicorn (ASGI)
- **Testing:** Pytest & Starlette TestClient

---

## 7. Installation Instructions

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Python** >= 3.10
- **pip** and `python3-venv`

```bash
# Clone the repository
cd "/home/mugesh-surya/Desktop/IT Hackthon"
```

---

## 8. Backend Startup Instructions

```bash
cd backend

# 1. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the FastAPI development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- **API Base:** `http://localhost:8000`
- **Swagger Documentation:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/api/v1/health`

---

## 9. Frontend Startup Instructions

In a separate terminal window:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Launch Vite development server
npm run dev
```

- **Application URL:** `http://localhost:5173`

---

## 10. AI Provider Configuration

Configure your AI provider in `backend/.env`:

```env
# AI Provider Options: 'mock' (offline deterministic), 'gemini', or 'claude'
S2S_AI_PROVIDER=mock

# Google Gemini API Key (Required if S2S_AI_PROVIDER=gemini)
GEMINI_API_KEY=your_gemini_api_key_here

# Anthropic Claude API Key (Required if S2S_AI_PROVIDER=claude)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# SQLite Storage Path
S2S_STORAGE_DIR=/tmp/s2s_data

# CORS Allowed Origins
S2S_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

*Note: For completely offline demonstration and testing with zero token cost and zero network latency, keep `S2S_AI_PROVIDER=mock`.*

---

## 11. Testing Instructions

Sketch2Screen AI includes four distinct automated testing layers:

### 1. Backend Integration & Unit Tests (Pytest)
```bash
cd backend
pytest -v
```
*(42 of 42 tests passing across upload, AI fallback, malformed JSON, persistence, fidelity, and export security)*

### 2. Frontend Unit & Sanitization Tests
```bash
cd frontend
npm test
```
*(21 of 21 tests passing across protocol sanitization, AST TSX compiler, component registry, and editor store)*

### 3. Production Build & TypeScript Verification
```bash
cd frontend
npm run build
```
*(Zero TypeScript errors; compiles production bundle cleanly)*

### 4. Playwright End-to-End Suite
```bash
cd frontend
npx playwright test
```
*(9 of 9 browser user journeys passing)*

### 5. Standalone Export Build Test
```bash
cd /tmp/s2s_exported_build_test
npm run build
```
*(Vite production build succeeds in ~820ms in an isolated directory)*

---

## 12. Known Limitations

1. **Intricate Vector Illustrations:** Hand-drawn representations of complex multi-series vector charts or 3D graphics are mapped to structured `Table` data components or `ImagePlaceholder` blocks rather than custom canvas code.
2. **Single-Screen Scope:** Version 1.0 targets individual screen wireframes and responsive viewports; multi-page navigation routing state graphs are left for post-export integration.
3. **Severe Lighting & Shadow Gradients:** High-contrast pen or marker sketches yield superior contour extraction compared to faint 2H pencil strokes under uneven camera shadows.
4. **Third-Party API Rate Limits:** Production deployments using public VLM APIs must handle rate limits (`HTTP 429`); the included `MockVLMProvider` ensures deterministic offline execution.

*(See [docs/limitations.md](docs/limitations.md) for detailed analysis).*

---

## 13. Security Considerations

- **No Secret Exposure:** API credentials remain strictly server-side in backend environment variables and are never transmitted to the browser or embedded in exported code.
- **Zero Arbitrary Execution:** Model responses are constrained to Pydantic data schemas. Neither `eval()`, `new Function()`, nor `dangerouslySetInnerHTML` is used.
- **Protocol & CSS Sanitization:** Link URLs are filtered to prevent `javascript:`, `data:`, and `file:` exploits; Tailwind classes and inline styles are stripped of injection vectors.
- **Path Traversal Protection:** The archive builder normalizes all paths via stack tokenization (`sanitize_zip_path`), preventing `../` escape sequences.

---

## 14. Documentation Index

- [Architecture Specification](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Visual Design System](docs/design-system.md)
- [Testing & Quality Assurance Guide](docs/testing.md)
- [Known Limitations & Boundaries](docs/limitations.md)
- [5-Minute Demonstration Script](docs/demo-script.md)
- [Scientific Evaluation Plan](docs/evaluation-plan.md)
- [Export Workflow & ZIP Security](docs/export-workflow.md)

---

## 📜 License
MIT License. Built for production UI acceleration with security and verifiable fidelity.
