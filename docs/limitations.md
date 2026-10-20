# Sketch2Screen AI (S2S ux) — Known Limitations & Architectural Boundaries

**Document Status:** Honest Engineering Assessment  
**Version:** 1.0.0  
**Scope:** Core Computer Vision, Multimodal AI, Editor State, and React Code Export

---

## 1. Executive Statement

Sketch2Screen AI provides an automated bridge between hand-drawn wireframes and editable React code. However, building software from human handwriting is an inherently non-deterministic problem. Rather than masking these realities behind exaggerated accuracy claims, this document explicitly outlines the technical limitations, edge cases, and current boundaries of the system.

---

## 2. Computer Vision & Preprocessing Boundaries

### 2.1 Lighting, Shadows, and Paper Artifacts
- **Current Behavior:** The OpenCV preprocessor applies CLAHE (Contrast Limited Adaptive Histogram Equalization) and adaptive thresholding to isolate wireframe strokes.
- **Limitation:** Photographs of sketches taken under harsh directional lighting, cast shadows (e.g. from the photographer's hand or smartphone), or on heavily wrinkled paper can produce fragmented contours or spurious noise blobs.
- **Workaround / Best Practice:** Best results are achieved with flat, evenly lit whiteboard photos, digital iPad/tablet drawings, or high-contrast dark ink on plain white paper.

### 2.2 Faint Pencil Strokes vs Heavy Ink
- **Current Behavior:** Contour detection algorithms rely on gradient intensity differences.
- **Limitation:** Faint 2H/HB pencil sketches with low optical density may fail thresholding, leading to missed components.
- **Mitigation:** The preprocessor exposes multiple selectable strategies (`clahe_enhanced`, `adaptive_threshold`, `canny_edge`), but ink or high-contrast markers remain strongly recommended.

### 2.3 Headless Container Dependencies
- **Current Behavior:** Full OpenCV features depend on system-level graphics libraries (`libGL.so.1`, `libglib2.0-0`).
- **Limitation:** In ultra-minimal Docker container environments (e.g. alpine or slim debian without graphics dependencies), OpenCV imports raise shared library errors.
- **Mitigation:** The system implements an automatic, non-crashing fallback to Pillow (`PIL.Image`) resampling and contrast enhancement.

---

## 3. Multimodal AI & VLM Interpretation Boundaries

### 3.1 Upstream Network Latency & Rate Limits
- **Current Behavior:** Full multimodal interpretation relies on external vision-language model APIs (Google Gemini 1.5 Pro, Anthropic Claude 3.5 Sonnet).
- **Limitation:** External API round-trip times vary between 1.5s and 5.0s depending on payload resolution and provider load. Upstream rate limits (`HTTP 429 Too Many Requests`) can occur on free-tier API quotas.
- **Mitigation:** The application includes a deterministic `MockVLMProvider` specifically designed for reproducible offline demonstrations and continuous integration test suites.

### 3.2 Complex Custom Visualizations & Vector Graphics
- **Current Behavior:** The component registry supports 13 approved, sandboxed UI primitives (`Container`, `Navbar`, `Heading`, `Text`, `Button`, `Input`, `Card`, `Badge`, `Avatar`, `Checkbox`, `Divider`, `ImagePlaceholder`, `Table`).
- **Limitation:** Hand-drawn representations of complex interactive charts, multi-series heatmaps, or vector game graphics cannot be synthesized into arbitrary custom React graphics.
- **Result:** The system maps unrecognized chart wireframes into structured `Table` data components or `ImagePlaceholder` blocks with descriptive dimension notes.

### 3.3 Handwritten Cursive & Ambiguous Arrow References
- **Current Behavior:** The prompt synthesizer asks the VLM to extract handwritten notes and arrows.
- **Limitation:** Heavy cursive handwriting or overlapping arrows pointing between nested containers can occasionally result in misattributed property assignments (e.g. assigning a button color note to the parent card).
- **Mitigation:** The Studio Editor provides immediate visual selection, properties inspection, and targeted natural language correction (`"Make the button blue"`) so users can correct assignments in seconds.

---

## 4. Application Scope & Architecture Boundaries

### 4.1 Single-Screen Focus vs Multi-Page Site Navigation
- **Current Behavior:** Each project corresponds to a single-screen wireframe interface with responsive viewport modes (Desktop, Tablet, Mobile).
- **Limitation:** Version 1.0 does not automatically synthesize multi-page application routing graphs (e.g. navigating between 10 linked screens with global shared state).
- **Export Reality:** Exported Vite applications provide a self-contained, working screen. Developers integrate standard routing (`react-router-dom`) when incorporating the screen into larger codebases.

### 4.2 Dynamic Backend Logic & Business Workflows
- **Current Behavior:** Sketch2Screen AI outputs client-side presentation components, layout containers, and styled UI primitives.
- **Limitation:** The system does not attempt to generate backend database schemas, SQL migrations, authentication services, or server-side API handlers from a sketch.
- **Design Decision:** This boundary is intentional. Generating speculative backend code from UI sketches introduces severe architectural and security risks.

---

## 5. Summary of Recommended User Practices

| Sketch Characteristic | Recommended Approach | Less Optimal (Requires Manual Studio Correction) |
| :--- | :--- | :--- |
| **Medium** | Black ink pen, whiteboard marker, iPad sketch | Faint pencil on textured or colored paper |
| **Lighting** | Uniform overhead light, scan or flat camera shot | Dim lighting with strong hand shadows |
| **Annotations** | Clear print handwriting with directional lines | Overlapping cursive script across components |
| **Components** | Buttons, forms, tables, cards, navbars, headers | Arbitrary custom 3D vector canvas illustrations |
