# Sketch2Screen AI (S2S ux) — API Reference Specification

**Base URL:** `http://localhost:8000/api/v1`  
**Protocol:** REST / JSON  
**Authentication:** Environment-configured backend secrets; client endpoints validate via schema and path parameters.

---

## 1. System & Health

### `GET /health`
Verifies backend operational status, active storage directory, and system readiness.

- **Request:** None
- **Response Headers:** `Content-Type: application/json`
- **Response Status:** `200 OK`
- **Response Schema:**
```json
{
  "status": "healthy",
  "service": "Sketch2Screen AI"
}
```

---

## 2. Sketch Upload & Vision Ingestion

### `POST /sketches/upload`
Uploads a hand-drawn UI sketch, photograph, or wireframe blueprint for processing.

- **Request:** `multipart/form-data`
  - `file`: Binary file (`image/png`, `image/jpeg`, or `image/webp`). Max size: 10 MB. Minimum dimensions: 100x100 px.
- **Validation Rules:**
  - Files with non-image MIME types or malicious payload extensions (`.sh`, `.exe`, `.js`) are rejected with `HTTP 400 Bad Request`.
  - Corrupted binary image headers are rejected with `HTTP 400 Bad Request`.
  - Images with width or height under 100 px are rejected with `HTTP 400 Bad Request`.
- **Response Status:** `200 OK`
- **Response Schema:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "filename": "sketch_login.png",
  "content_type": "image/png",
  "size_bytes": 142058,
  "width": 1280,
  "height": 960,
  "uploaded_at": "2026-10-20T14:30:00.000Z"
}
```

---

### `POST /sketches/{sketch_id}/analyze`
Executes computer vision preprocessing on an uploaded sketch, optimizing contrast via CLAHE, thresholding, and contour detection.

- **Path Parameters:**
  - `sketch_id` (string, required): ID returned by `/sketches/upload`.
- **Query Parameters:**
  - `strategy` (string, optional): Analysis algorithm. Supported values: `auto`, `adaptive_threshold`, `canny_edge`, `clahe_enhanced`. Default: `auto`.
- **Response Status:** `200 OK`
- **Response Schema:**
```json
{
  "sketch_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "strategy_applied": "clahe_enhanced",
  "image_dimensions": { "width": 1280, "height": 960 },
  "detected_contours": [
    {
      "contour_id": "c_001",
      "x": 60,
      "y": 40,
      "width": 1160,
      "height": 70,
      "normalized_bounds": { "x": 0.047, "y": 0.042, "width": 0.906, "height": 0.073 },
      "area": 81200,
      "aspect_ratio": 16.57
    }
  ],
  "preprocessed_image_path": "/tmp/s2s_data/sketches/a1b2c3d4_preprocessed.png"
}
```

---

## 3. Project Generation & Lifecycle

### `POST /projects/generate`
Invokes the configured Vision-Language Model provider to interpret sketch contours, user annotations, and layout hierarchy, compiling them into a validated Pydantic AST document stored in SQLite.

- **Request Body (`application/json`):**
```json
{
  "sketch_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "CloudOps Telemetry Dashboard",
  "user_annotations": [
    "Sticky top navbar with brand and links",
    "Primary audit button placed on right side",
    "3-column responsive metric cards layout"
  ],
  "design_system": "modern-dark"
}
```
- **Response Status:** `200 OK`
- **Response Schema:**
```json
{
  "id": "proj_9f8e7d6c",
  "title": "CloudOps Telemetry Dashboard",
  "status": "generated",
  "sketch_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "created_at": "2026-10-20T14:32:00.000Z",
  "updated_at": "2026-10-20T14:32:00.000Z",
  "node_count": 14,
  "fidelity_score": 88.5,
  "interface": {
    "id": "root-container",
    "type": "Container",
    "name": "Root Canvas",
    "props": { "layout": "flex-col", "gap": "gap-6", "padding": "p-6" },
    "styles": { "tailwindClasses": "min-h-screen bg-slate-950 text-slate-100" },
    "children": [ ... ],
    "meta": { "title": "CloudOps Telemetry Dashboard", "version": "1.0.0" }
  }
}
```

---

### `GET /projects`
Retrieves all saved project records from SQLite storage.

- **Response Status:** `200 OK`
- **Response Schema:** Array of `ProjectSummary`:
```json
[
  {
    "id": "proj_9f8e7d6c",
    "title": "CloudOps Telemetry Dashboard",
    "status": "generated",
    "sketch_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2026-10-20T14:32:00.000Z",
    "updated_at": "2026-10-20T14:35:10.000Z",
    "node_count": 14,
    "fidelity_score": 88.5
  }
]
```

---

### `GET /projects/{project_id}`
Fetches the full project record including sketch metadata and complete AST interface document.

- **Path Parameters:** `project_id` (string, required)
- **Response Status:** `200 OK` (or `404 Not Found`)

---

### `PATCH /projects/{project_id}/rename`
Renames an existing project record in SQLite.

- **Request Body:**
```json
{
  "title": "Production CloudOps Console v2"
}
```
- **Response Status:** `200 OK`

---

### `DELETE /projects/{project_id}`
Permanently deletes a project from SQLite storage.

- **Response Status:** `200 OK`
```json
{
  "success": true,
  "message": "Project proj_9f8e7d6c deleted successfully."
}
```

---

## 4. AST Editing & Targeted Corrections

### `PUT /projects/{project_id}/interface`
Replaces the full AST interface document with validated updates.

- **Request Body:** Validated `InterfaceDocument` object.
- **Validation:** Bounded depth, verified node types (`Button`, `Input`, `Card`, etc.). Malformed structures return `HTTP 422 Unprocessable Entity`.
- **Response Status:** `200 OK`

---

### `POST /projects/{project_id}/components/{component_id}/edit`
Directly modifies properties or styles of a targeted component without full-page re-synthesis.

- **Request Body:**
```json
{
  "props": { "label": "Save Changes", "variant": "primary" },
  "styles": { "tailwindClasses": "bg-blue-600 text-white font-bold" }
}
```
- **Response Status:** `200 OK`

---

### `POST /projects/{project_id}/corrections/natural`
Translates natural-language feedback (e.g. *"Make the audit button emerald green"*) into a targeted, atomic AST update without regenerating the entire screen.

- **Request Body:**
```json
{
  "prompt": "Make the login button electric blue and full width",
  "component_id": "btn-action-01"
}
```
- **Response Status:** `200 OK`
- **Response Schema:**
```json
{
  "success": true,
  "componentId": "btn-action-01",
  "explanation": "Applied primary blue styling and 'w-full' width to action button.",
  "interface": { ... }
}
```

---

## 5. Sketch Fidelity Evaluation

### `POST /projects/{project_id}/fidelity-check`
Runs the deterministic Sketch Fidelity Checker comparing OpenCV sketch contours against the synthesized React component AST across **7 distinct dimensions**.

- **Response Status:** `200 OK`
- **Response Schema:**
```json
{
  "overallScore": 88.5,
  "rating": "high",
  "disclaimer": "Fidelity scores are computed via normalized contour bounding box IoU and structural presence. Heuristic dimensions without measurable contour data are strictly excluded from the weighted score.",
  "scoreBreakdown": {
    "dimensions": [
      { "dimension": "presence", "name": "Component Presence", "score": 95.0, "weight": 0.20, "findingsCount": 0 },
      { "dimension": "ordering", "name": "Spatial Ordering", "score": 90.0, "weight": 0.15, "findingsCount": 0 },
      { "dimension": "position", "name": "Relative Position", "score": 82.0, "weight": 0.20, "findingsCount": 1 },
      { "dimension": "size", "name": "Component Dimensions", "score": 85.0, "weight": 0.15, "findingsCount": 1 },
      { "dimension": "text", "name": "Text & Label Consistency", "score": 92.0, "weight": 0.10, "findingsCount": 0 },
      { "dimension": "layout", "name": "Layout Structure", "score": 90.0, "weight": 0.10, "findingsCount": 0 },
      { "dimension": "annotation", "name": "Annotation Adherence", "score": 85.0, "weight": 0.10, "findingsCount": 1 }
    ]
  },
  "findings": [
    {
      "findingId": "find_pos_01",
      "category": "position",
      "severity": "medium",
      "title": "Action button shifted horizontally",
      "description": "Contour detected button at right header corner (x: 740), AST positioned at left (x: 200).",
      "suggestedFix": "Align button to right flex end with 'justify-between'."
    }
  ]
}
```

---

## 6. Code Generation & Export

### `POST /projects/{project_id}/export`
Compiles the project AST into production code.

- **Query Parameters:**
  - `format` (string, optional): `tsx` for raw component source, or `zip` for a turnkey Vite + React application package. Default: `zip`.
- **Response Status:** `200 OK`
- **Response Types:**
  - When `format=tsx`: Returns `text/plain` containing compiled TypeScript JSX code.
  - When `format=zip`: Returns `application/zip` containing the complete Vite + React 18 + Tailwind CSS project bundle. Path traversal (`../`) is strictly blocked.
