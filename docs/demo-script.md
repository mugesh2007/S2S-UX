# Sketch2Screen AI (S2S ux) — 5-Minute Technical Demonstration Script

**Target Audience:** Technical Judges, Software Architects, and AI Engineers  
**Duration:** 5 Minutes Exact  
**Mode:** Live Browser & Backend Terminal Execution  
**Goal:** Demonstrate the end-to-end transformation of an annotated hand-drawn sketch into an editable, mathematically verified, buildable React application.

---

## Pre-Demonstration Checklist (T-minus 2 Minutes)

1. **Backend Server Running:**
   ```bash
   cd backend && uvicorn main:app --reload --port 8000
   ```
   *Verify:* Visit `http://localhost:8000/api/v1/health` (returns `{"status":"healthy","service":"Sketch2Screen AI"}`).
2. **Frontend Running:**
   ```bash
   cd frontend && npm run dev
   ```
   *Verify:* Open `http://localhost:5173` in Chromium.
3. **Sample Sketch Prepared:**
   - Sample file: `frontend/public/samples/dashboard-sketch.png` (or a photograph of a whiteboard sketch).
   - Alternatively, use the built-in curated template: *"CloudOps Analytics Dashboard"*.

---

## Demonstration Script & Timeline

```
  00:00           01:00           02:15           03:30           04:30   05:00
    │               │               │               │               │       │
    ▼               ▼               ▼               ▼               ▼       ▼
[Problem &     [Upload &       [Visual Studio  [Fidelity       [Export &   [Close]
 Raw Sketch]    Interpretation] & Targeted Edit] Check & Fix]   Build Test]
```

---

### Phase 1: Problem Statement & Raw Sketch Reference (0:00 – 0:45)
- **Presenter Screen:** Landing page at `http://localhost:5173`.
- **Action:**
  1. Show the landing page hero: *"From Hand-Drawn Ideas to Editable Interfaces"*.
  2. Click **"Start Creating"** to navigate to `/upload`.
  3. Show the raw hand-drawn wireframe sketch (on screen or printed):
     - Point out: Sticky navbar, heading *"System Metrics"*, 3 metric cards, and a handwritten annotation note: *"Primary audit button placed on right side"*.
- **Speaker Narrative:**
  > *"Every software team begins on a whiteboard or a paper notebook. But converting sketches into code usually takes hours of repetitive markup. Traditional AI approaches either output static images or hallucinated code filled with broken dependencies.  
  > Sketch2Screen AI solves this with a two-part architectural innovation: a strict zero-eval AST sandbox combined with an automated computer vision fidelity verification engine."*

---

### Phase 2: Upload & Multimodal Interpretation (0:45 – 1:45)
- **Presenter Screen:** Workspace Upload page (`/upload`).
- **Action:**
  1. Click the upload dropzone (or select template card *"CloudOps Analytics Dashboard"*).
  2. Notice the live sketch preview renders with dimensions and the badge: **Validated for OpenCV Processing**.
  3. Point to the annotations list:
     - *"Sticky top navbar with brand and links"*
     - *"Primary audit button placed on right side"*
     - *"3-column responsive metric cards layout"*
  4. Click **"Generate React Interface"**.
- **Presenter Screen:** Telemetry & Pipeline page (`/generate`).
- **Action:**
  1. Watch the 4 pipeline stages execute with millisecond latency:
     - Stage 1: OpenCV CLAHE contrast & contour detection (~320ms)
     - Stage 2: Vision-Language Model multimodal AST mapping (~1.1s)
     - Stage 3: Pydantic schema validation & allowlist verification (~200ms)
     - Stage 4: Hungarian bipartite contour alignment scoring (~300ms)
  2. Explain the diagnostic stream in the lower terminal window.
- **Speaker Narrative:**
  > *"Notice that we are not asking the AI to write freeform JavaScript. Instead, the model extracts layout geometry and maps detected strokes directly into a validated Abstract Syntax Tree. Because every node is validated by Pydantic before reaching the browser, injection attacks and broken imports are mathematically impossible."*

---

### Phase 3: Live Visual Studio & Targeted Component Editing (1:45 – 2:45)
- **Presenter Screen:** Studio Editor page (`/editor`).
- **Action:**
  1. Click **"Open Studio Editor"**.
  2. Show the live canvas rendered inside the dark obsidian studio.
  3. Demonstrate responsive viewports: Click **Tablet (768px)**, then **Mobile (390px)**, then back to **Desktop (1280px)**.
  4. Select the header action button:
     - In the Properties Inspector on the right, change its label from *"Action Button"* to *"Run Security Audit"*.
     - In the AI Natural Language command bar, type: `"Make it blue and full width"` and click **"Apply"**.
     - Observe the button instantly re-render in electric blue without regenerating the page.
- **Speaker Narrative:**
  > *"Here is the live interface. Notice that the entire screen is interactive. We can switch viewports to inspect responsive behavior. When we edit a component or give natural-language commands like 'make it blue', the system applies targeted, non-destructive mutations to the specific AST node without re-synthesizing the rest of the interface."*

---

### Phase 4: Sketch Fidelity Checker & Automated Difference Correction (2:45 – 3:45)
- **Presenter Screen:** Fidelity Report page (`/fidelity`).
- **Action:**
  1. Click **"Audit Report"** in the top studio bar.
  2. Point to the overall score: **88.5% High Structural Alignment**.
  3. Click through the **7 Vision Dimension Pills**:
     - *Component Presence (95%)*
     - *Spatial Ordering (90%)*
     - *Relative Position (82%)*
     - *Component Dimensions (85%)*
     - *Text Consistency (92%)*
     - *Layout Structure (90%)*
     - *Annotation Adherence (85%)*
  4. Review the detected finding:
     - Finding: *"Action button shifted horizontally from sketch coordinates (740, 90)"*.
  5. Click **"Apply Correction"**:
     - Notice finding status changes to **Applied**, and score updates dynamically.
- **Speaker Narrative:**
  > *"This is our second main innovation: the Sketch Fidelity Checker. Unlike generative tools that output code blindly, our engine measures fidelity across 7 distinct dimensions comparing OpenCV sketch contours to the generated UI bounds. It doesn't just score the design—it pinpoints exact spatial discrepancies and allows developers to apply one-click non-destructive corrections."*

---

### Phase 5: Production React Export & Standalone Verification (3:45 – 4:45)
- **Presenter Screen:** Studio Editor (`/editor`) -> Export Modal.
- **Action:**
  1. Click **"Export React"** in the top bar.
  2. Inspect the compiled TypeScript code preview:
     - Point out: Clean React 18, modular imports, Tailwind CSS tokens, zero `eval()` calls.
  3. Click **"Download Package (ZIP)"**.
  4. Switch to the terminal and execute the standalone build verification:
     ```bash
     cd /tmp/s2s_exported_build_test && npm run build
     ```
  5. Show the Vite build output:
     `✓ built in 822ms` with `dist/assets/index.js` and `dist/index.html`.
- **Speaker Narrative:**
  > *"When we export the project, the system packages a turnkey Vite + React 18 + Tailwind CSS application into a secure ZIP archive protected against path traversal. To prove this is real production software, we compile the exported project right here in an isolated terminal—100% clean TypeScript build in 822 milliseconds."*

---

### Phase 6: Conclusion & Core Innovation Takeaway (4:45 – 5:00)
- **Speaker Narrative:**
  > *"In summary, Sketch2Screen AI bridges the gap between hand-drawn product brainstorming and production software engineering. By replacing blind code generation with a sandboxed AST schema, a 7-dimension computer vision fidelity engine, and instant React compilation, developers can move from whiteboard to working code in seconds."*
