# Sketch2Screen AI (S2S ux) — FastAPI Backend

Modular, production-minded FastAPI service providing image validation, computer vision preprocessing (CLAHE, bilateral filtering, Otsu adaptive binarization, contour detection), multimodal VLM sketch-understanding, multi-tier fidelity checking, and React code compilation.

---

## 1. Quickstart

### Prerequisites
- Python 3.12+
- Node.js 20+ (for frontend)

### Installation
```bash
cd backend
pip install -r requirements.txt
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment variables:
- `CORS_ORIGINS`: Allowed client origins (default: `["http://localhost:5173", "http://localhost:4173"]`).
- `MAX_UPLOAD_SIZE_BYTES`: Image upload limit (default: 10MB).
- `VLM_PROVIDER`: Multimodal provider selection (`"mock"` for offline testing, `"gemini"` for live models).
- `GEMINI_API_KEY`: Google GenAI API key (backend only, never exposed to client).
- `GEMINI_MODEL`: Model identifier (default: `"gemini-3.8-flash"`).

---

## 2. AI Provider Architecture & Pipeline

### Architecture
The sketch-understanding pipeline uses a provider abstraction under `backend/app/ai/`:
- `base.py`: Defines the `IVLMProvider` abstract interface.
- `factory.py`: `VLMProviderFactory` dynamically instantiates providers based on environment configuration (`VLM_PROVIDER`).
- `gemini_provider.py`: Google Gemini VLM provider communicating via direct HTTPS REST calls with structured JSON output, retryable error mapping, and Pydantic validation.
- `mock_provider.py`: Offline deterministic mock provider producing rich ASTs, annotation proposals, and uncertainty indicators with `is_mock=True` telemetry.
- `prompt_templates.py`: Strict system prompts enforcing allowlisted component vocabulary, [0, 1000] normalized bounding boxes, visible evidence vs. inference separation, and proposed annotation change extraction.

### The 8-Step Sketch-Understanding Pipeline
1. **Receive Sketch:** `POST /api/v1/sketches/upload` accepts raw multipart file, verifies magic bytes, formats (PNG, JPEG, WebP), and enforces dimensions.
2. **Load Original Image:** Safe UUID-based disk retrieval (`image_service.read_sketch_bytes`).
3. **Create Analysis Versions:** `cv_preprocessor.prepare_vision_analysis_image` handles EXIF rotation, alpha channel composite over solid white, LANCZOS aspect-ratio scaling (max 1920px), and stroke contrast enhancement via Pillow/OpenCV.
4. **Send to VLM:** Transmit normalized image and contextual instructions to the configured VLM provider.
5. **Request Structured JSON:** Gemini is invoked with `response_mime_type: "application/json"` and temperature `0.1`.
6. **Parse & Validate AST:** `InterfaceDocument.model_validate()` validates the response against strict Pydantic schemas and recursion safety checks (max 12 levels).
7. **Reject Malformed / Unsafe Structures:** Arbitrary injected HTML/tags or unallowed component types outside the strict allowlist are rejected with actionable `SCHEMA_VALIDATION_ERROR` errors.
8. **Return Validated Document:** Returns the validated `InterfaceDocument` to the client.

### Supported Component Allowlist
The schema enforces a strict allowlist of supported component types:
- `Container` (Flex and Grid layout containers)
- `Heading` (H1-H6)
- `Text` (Paragraphs, captions, body labels)
- `Button` (Primary, secondary, outline, danger, ghost)
- `Input` / `TextInput` (Text, search, email fields)
- `ImagePlaceholder` (Wireframe image aspect ratios)
- `Card` (Framed cards with headers and bodies)
- `Navbar` / `Navigation bar` (Top navigation with links)
- `Divider` (Horizontal/vertical separators)
- `Checkbox` (Form checkboxes with labels)
- `Badge`, `Avatar`, `Table`

Arbitrary types outside this registry are rejected during Pydantic AST validation.

### Annotation Awareness
Handwritten annotations, arrows, and notes are extracted into `meta.proposedChanges`:
- `rawAnnotation`: Exact text recognized in the sketch.
- `targetElementId`: Target element indicated by arrows or adjacency.
- `actionType`: `style_change`, `layout_shift`, `insert_component`, or `property_update`.
- `explanation`: Detailed rationale based on visual evidence.
- `confidence`: Confidence score (0.0 to 1.0).
- `isApplied`: Set to `false` by default—proposed changes are **never silently applied** without user confirmation.

---

## 3. Configuring the AI Provider

### Option A: Deterministic Mock Provider (Default / Offline)
Ideal for local testing, CI/CD, and offline UI development:
```bash
# In backend/.env
VLM_PROVIDER="mock"
```
The mock provider returns a realistic dashboard AST with annotations and uncertainty flags, explicitly setting:
```json
{
  "meta": {
    "aiProvider": "mock",
    "isMock": true
  }
}
```

### Option B: Google Gemini Multimodal Vision API
To connect live multimodal inference:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Set the configuration in `backend/.env`:
```bash
VLM_PROVIDER="gemini"
GEMINI_API_KEY="your-google-ai-studio-api-key"
GEMINI_MODEL="gemini-3.8-flash"
```
3. Restart the backend server. The health endpoint at `GET /api/v1/health` will report:
```json
{
  "status": "healthy",
  "active_vlm_provider": "gemini",
  "ai_provider_info": {
    "provider": "gemini",
    "model": "gemini-3.8-flash",
    "configured": true,
    "status": "ready"
  }
}
```

---

## 4. Running the Server

Start the FastAPI application with Uvicorn:
```bash
# From workspace root:
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation:
- Swagger UI: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- ReDoc: [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)
- Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 5. Running Tests

Execute the comprehensive automated test suite:
```bash
python3 -m pytest -v backend/tests/
```

All 26 unit and integration tests verify:
- **AI Pipeline Tests (`test_ai_pipeline.py`):**
  - Offline Mock provider AST synthesis and proposed changes
  - Provider factory resolution and invalid provider rejection
  - Missing API key detection (`MISSING_API_KEY`)
  - Oversized image rejection (`OVERSIZED_IMAGE`)
  - Valid mocked Gemini 200 response parsing and metadata stamping
  - Malformed model JSON handling (`MALFORMED_MODEL_OUTPUT`)
  - Arbitrary / unallowed component type rejection (`SCHEMA_VALIDATION_ERROR`)
  - Missing required fields validation
  - HTTP 429 rate limit handling (`RATE_LIMIT_EXCEEDED`)
  - Network timeout handling (`API_TIMEOUT`)
  - Network error handling (`NETWORK_ERROR`)
  - Pillow/OpenCV vision analysis normalization pipeline
- **Sketch Endpoints Tests (`test_sketches.py`):**
  - Image format validation (PNG, JPEG, WebP)
  - Corrupted and sub-minimum dimension image rejection
  - CV preprocessing filter strategies
- **Project Endpoints Tests (`test_projects.py`):**
  - Project generation, listing, retrieval, and AST replacement
  - Component-level prop and style editing
  - Quantitative fidelity analysis
  - Standalone TSX and Vite ZIP project exports
- **Health Check Tests (`test_health.py`):**
  - Health check endpoint telemetry

---

## 6. Security Safeguards
1. **Magic Bytes & Header Verification:** Rejects arbitrary files disguised as images.
2. **Path Traversal Prevention:** UUID-based storage resolved against base directories.
3. **Zero Dynamic Evaluation:** Interfaces are parsed to strict AST schemas; no arbitrary JS execution (`eval`, `new Function`, `dangerouslySetInnerHTML`).
4. **Credential Isolation:** API keys remain strictly on the backend; never exposed to the frontend.
5. **Safe Error Masking:** Production errors return RFC 7807 problem details without leaking stack traces or internal environment variables.

