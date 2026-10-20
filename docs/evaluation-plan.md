# Sketch2Screen AI (S2S ux) — Scientific Evaluation Plan & Benchmark Specification

**Document Status:** Formal Evaluation Methodology Draft  
**Version:** 1.0.0  
**Notice:** In accordance with rigorous scientific standards, this document defines the evaluation methodology, dataset requirements, mathematical metrics, and benchmarking protocol. Empirical results are not reported until the physical sketch dataset has been fully collected, annotated with ground-truth ASTs, and processed through the automated evaluation harness.

---

## 1. Evaluation Objectives

The objective of this evaluation framework is to quantitatively measure:
1. **Multimodal Extraction Quality:** How accurately the vision-language model detects UI primitives, bounding coordinates, and handwritten annotations from diverse sketch qualities.
2. **Fidelity Checker Reliability:** Whether the 7-dimension computer vision engine accurately detects real layout discrepancies without generating false positive findings.
3. **Downstream Compilation Viability:** The proportion of exported React projects that compile and bundle without manual developer intervention.
4. **Developer Productivity Gain:** The reduction in manual markup time achieved compared to hand-coding from a wireframe.

---

## 2. Representative Sketch Corpus Architecture

To ensure statistically meaningful evaluation across real-world conditions, the benchmark corpus spans **8 distinct sketch categories** with a minimum of 10 samples per category (80 total evaluation samples):

| Category ID | Screen & Sketch Archetype | Real-World Challenge / Characteristic |
| :--- | :--- | :--- |
| **CAT-01** | **Simple Login Screens** | Centered form card, 2 text inputs (email/password), primary button, OAuth social SSO links, forgot password link. |
| **CAT-02** | **Multi-Step Registration Screens** | Form progress indicators, 4–6 field inputs, validation checkboxes, terms and conditions link, submit button. |
| **CAT-03** | **Analytics Dashboards** | Top sticky navbar, 3–4 metric cards, data table with 4 columns, and action buttons. |
| **CAT-04** | **E-Commerce Checkout & Products** | Two-column grid, product image placeholders, quantity selectors, pricing summary table, checkout CTA. |
| **CAT-05** | **Mobile Native App Layouts** | Single-column 9:16 aspect ratio, mobile navigation tab bar, avatar headers, list view items. |
| **CAT-06** | **Rough Pencil Wireframes** | 2H/HB light pencil strokes, variable line weights, uneven paper texture, smudge marks. |
| **CAT-07** | **Low-Quality Mobile Photographs** | Directional lighting gradients, perspective skew (10°–25° off-axis), camera sensor noise, mild shadows. |
| **CAT-08** | **Heavily Annotated Blueprints** | Hand-drawn arrow connectors, circled callouts, margin notes (e.g. *"Full width on mobile"*, *"Color: Emerald"*). |

---

## 3. Measurable Mathematical Metrics

### 3.1 Component Identification Precision & Recall
Evaluates whether components present in the ground-truth sketch are detected and categorized correctly by the VLM.

- **True Positive ($TP_c$):** Component of type $C$ detected within 50px normalized bounding distance of ground truth.
- **False Positive ($FP_c$):** Component detected where none exists, or classified with wrong component type.
- **False Negative ($FN_c$):** Ground-truth component missed by the vision model.

$$\text{Precision}_c = \frac{TP_c}{TP_c + FP_c}, \quad \text{Recall}_c = \frac{TP_c}{TP_c + FN_c}, \quad F1_c = 2 \cdot \frac{\text{Precision}_c \cdot \text{Recall}_c}{\text{Precision}_c + \text{Recall}_c}$$

---

### 3.2 Component Spatial Position Error ($\epsilon_{\text{pos}}$)
Measures geometric displacement between the ground-truth sketch contour centroid $(x_{gt}, y_{gt})$ and the synthesized component centroid $(x_{syn}, y_{syn})$ in a normalized 1000x1000 coordinate space:

$$\epsilon_{\text{pos}} = \frac{1}{N} \sum_{i=1}^{N} \sqrt{(x_{syn, i} - x_{gt, i})^2 + (y_{syn, i} - y_{gt, i})^2}$$

Along with **Intersection over Union (IoU)** of component bounding boxes:
$$\text{IoU}(B_{syn}, B_{gt}) = \frac{\text{Area}(B_{syn} \cap B_{gt})}{\text{Area}(B_{syn} \cup B_{gt})}$$

---

### 3.3 Label Recognition Accuracy (Character & Word Error Rates)
Evaluates handwritten text and button label extraction accuracy against ground-truth transcription:

- **Character Error Rate (CER):**
  $$\text{CER} = \frac{S + D + I}{N_{\text{chars}}}$$
  *(where $S$ = Substitutions, $D$ = Deletions, $I$ = Insertions, $N_{\text{chars}}$ = total ground-truth characters)*
- **Word Error Rate (WER):** Computed over whitespace-delimited tokens.

---

### 3.4 Fidelity Checker Finding Precision & Recall
Evaluates the diagnostic accuracy of the 7-dimension Sketch Fidelity Checker:
- **True Finding:** Discrepancy flagged by the checker that corresponds to an actual human-annotated discrepancy.
- **Spurious Finding:** False alarm flagged by the checker where layout conforms to sketch intent.
- **Missed Discrepancy:** Severe human-visible deviation (e.g. missing button) that the checker failed to identify.

---

### 3.5 Exported Project Build Success Rate ($R_{\text{build}}$)
Measures the percentage of exported projects that complete automated compilation (`tsc && vite build`) without syntax or import errors:

$$R_{\text{build}} = \frac{N_{\text{successful\_builds}}}{N_{\text{total\_exports}}} \times 100\%$$

*Acceptance Criteria:* Target $\ge 99.0\%$ clean builds across all corpus categories.

---

### 3.6 Mean Time to Manual Correction (MTTC)
Timed usability test with 5 independent frontend developers:
- **Task:** Take the synthesized interface AST and modify it using the Studio Editor until it matches 100% of the sketch requirements.
- **Metric:** Time in seconds elapsed from initial editor load to final approved export.
- **Baseline Comparison:** Time required for the same developer to code the screen from scratch using React and Tailwind CSS.

---

## 4. Evaluation Execution Protocol

```
   [Physical Sketches] ──► [Camera / Scanner Capture] ──► [Corpus Preprocessing]
                                                                    │
   ┌────────────────────────────────────────────────────────────────┘
   ▼
1. INGESTION BENCHMARK: Run cv_preprocessor across all 80 images, recording threshold accuracy.
2. VLM EXTRACTION: Run active AI provider with standardized temperature (0.0).
3. PARSE & VALIDATE: Measure Pydantic schema validation rejection rates.
4. GEOMETRIC COMPARISON: Compute IoU matrix and spatial error against ground truth.
5. TEXT LEVENSHTEIN: Compute CER/WER against transcribed ground-truth text strings.
6. FIDELITY CHECK: Run fidelity_checker service; calculate precision/recall of findings.
7. COMPILATION TEST: Extract every exported ZIP; execute 'npm run build' in isolated container.
8. AGGREGATE TELEMETRY: Output standardized evaluation_results.json.
```

---

## 5. Result Reporting Format

All benchmark runs must output structured JSON matching the following schema:

```json
{
  "benchmark_metadata": {
    "timestamp": "ISO-8601",
    "provider_tested": "gemini-1.5-pro | claude-3.5-sonnet | mock",
    "dataset_version": "v1.0",
    "total_samples": 80
  },
  "metrics_summary": {
    "component_precision": 0.0,
    "component_recall": 0.0,
    "component_f1": 0.0,
    "mean_position_error_px": 0.0,
    "mean_bounding_iou": 0.0,
    "character_error_rate": 0.0,
    "word_error_rate": 0.0,
    "fidelity_finding_precision": 0.0,
    "fidelity_finding_recall": 0.0,
    "export_build_success_rate": 0.0,
    "mean_correction_time_seconds": 0.0
  },
  "category_breakdown": {
    "CAT-01_login": { "samples": 10, "precision": 0.0, "build_rate": 0.0 },
    "CAT-02_registration": { "samples": 10, "precision": 0.0, "build_rate": 0.0 },
    "CAT-03_dashboard": { "samples": 10, "precision": 0.0, "build_rate": 0.0 },
    "CAT-04_ecommerce": { "samples": 10, "precision": 0.0, "build_rate": 0.0 },
    "CAT-05_mobile": { "samples": 10, "precision": 0.0, "build_rate": 0.0 },
    "CAT-06_pencil": { "samples": 10, "precision": 0.0, "build_rate": 0.0 },
    "CAT-07_low_light": { "samples": 10, "precision": 0.0, "build_rate": 0.0 },
    "CAT-08_annotated": { "samples": 10, "precision": 0.0, "build_rate": 0.0 }
  }
}
```

*Note: Results are recorded strictly following automated test suite execution against physical datasets.*
