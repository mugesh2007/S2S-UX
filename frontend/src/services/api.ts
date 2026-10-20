/**
 * S2S ux Backend API Client
 * Connects the React frontend to the FastAPI service at /api/v1.
 * Supports safe server-side credential isolation and structured error handling.
 */

import { S2SNodeTree, ProjectMetadata, FidelityEvaluation } from '@/types/ast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface ApiErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export class ApiError extends Error {
  code: string;
  details?: Record<string, any>;
  status: number;

  constructor(message: string, code: string, status: number, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      let errorData: any = {};
      try {
        errorData = await res.json();
      } catch {
        // Fallback if not JSON
      }
      const err = errorData.error || {};
      throw new ApiError(
        err.message || `Request failed with HTTP status ${res.status}`,
        err.code || 'HTTP_ERROR',
        res.status,
        err.details
      );
    }

    // Handle binary responses (e.g. ZIP export)
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/zip') || contentType.includes('application/octet-stream')) {
      return (await res.blob()) as unknown as T;
    }

    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network connection failed: ${(error as Error).message}. Verify FastAPI server is running at ${API_BASE_URL}.`,
      'NETWORK_FAILURE',
      0
    );
  }
}

export const s2sApi = {
  /**
   * Health and telemetry check
   */
  async getHealth() {
    return request<{
      status: string;
      service: string;
      version: string;
      active_vlm_provider: string;
      ai_provider_info?: any;
      uptime_seconds: number;
    }>('/health');
  },

  /**
   * Step 1: Upload a sketch image
   */
  async uploadSketch(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request<{
      id: string;
      filename: string;
      mime_type: string;
      size_bytes: number;
      width: number;
      height: number;
    }>('/sketches/upload', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Step 3: Run OpenCV / Pillow contour analysis on an uploaded sketch
   */
  async analyzeSketch(sketchId: string, strategy: string = 'adaptive_clahe') {
    return request<{
      sketch_id: string;
      strategy_applied: string;
      detected_contours: Array<{
        id: string;
        contour_index: number;
        bounding_box: { x: number; y: number; w: number; h: number };
        area: number;
        aspect_ratio: number;
        confidence: number;
        suggested_type: string;
      }>;
      detected_annotations: string[];
      processing_time_ms: number;
    }>(`/sketches/${sketchId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ strategy }),
    });
  },

  /**
   * Step 4-8: Synthesize UI AST using configured VLM
   */
  async generateProject(payload: {
    sketch_id: string;
    title?: string;
    user_annotations?: string[];
    design_system?: string;
  }) {
    return request<{
      id: string;
      title: string;
      status: string;
      sketch_id: string;
      created_at: string;
      updated_at: string;
      node_count: number;
      fidelity_score?: number;
      interface: S2SNodeTree;
    }>('/projects/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * List all stored projects
   */
  async listProjects() {
    return request<ProjectMetadata[]>('/projects');
  },

  /**
   * Retrieve project AST by ID
   */
  async getProject(projectId: string) {
    return request<{
      id: string;
      title: string;
      status: string;
      sketch_id: string;
      created_at: string;
      updated_at: string;
      node_count: number;
      fidelity_score?: number;
      interface: S2SNodeTree;
    }>(`/projects/${projectId}`);
  },

  /**
   * Replace full interface AST with schema validation
   */
  async updateProjectInterface(projectId: string, interfaceTree: S2SNodeTree) {
    return request<{
      id: string;
      title: string;
      status: string;
      interface: S2SNodeTree;
    }>(`/projects/${projectId}/interface`, {
      method: 'PUT',
      body: JSON.stringify({ interface: interfaceTree }),
    });
  },

  /**
   * Mutate a single component node without regenerating the entire AST
   */
  async editComponent(
    projectId: string,
    componentId: string,
    patch: {
      name?: string;
      props?: Record<string, any>;
      styles?: { tailwindClasses?: string; customStyles?: Record<string, string> };
      boundingBox?: { x: number; y: number; w: number; h: number };
      isUncertain?: boolean;
    }
  ) {
    return request<{
      id: string;
      title: string;
      interface: S2SNodeTree;
    }>(`/projects/${projectId}/components/${componentId}/edit`, {
      method: 'POST',
      body: JSON.stringify(patch),
    });
  },

  /**
   * Rename a project title
   */
  async renameProject(projectId: string, title: string) {
    return request<{
      id: string;
      title: string;
      status: string;
      interface: S2SNodeTree;
    }>(`/projects/${projectId}/rename`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    });
  },

  /**
   * Delete a project from SQLite storage
   */
  async deleteProject(projectId: string) {
    return request<{ success: boolean; message: string }>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Natural-language targeted component correction
   */
  async applyNaturalCorrection(projectId: string, prompt: string, componentId?: string) {
    return request<{
      projectId: string;
      componentId: string;
      componentName: string;
      translatedPatch: Record<string, any>;
      explanation: string;
      interface: S2SNodeTree;
    }>(`/projects/${projectId}/corrections/natural`, {
      method: 'POST',
      body: JSON.stringify({ prompt, componentId }),
    });
  },

  /**
   * Duplicate a specific component in AST
   */
  async duplicateComponent(projectId: string, componentId: string) {
    return request<{
      id: string;
      title: string;
      interface: S2SNodeTree;
    }>(`/projects/${projectId}/components/${componentId}/duplicate`, {
      method: 'POST',
    });
  },

  /**
   * Delete a specific component from AST
   */
  async deleteComponent(projectId: string, componentId: string) {
    return request<{
      id: string;
      title: string;
      interface: S2SNodeTree;
    }>(`/projects/${projectId}/components/${componentId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Append a new child component to a container
   */
  async addComponent(projectId: string, parentId: string, component: any) {
    return request<{
      id: string;
      title: string;
      interface: S2SNodeTree;
    }>(`/projects/${projectId}/components/${parentId}/children`, {
      method: 'POST',
      body: JSON.stringify({ component }),
    });
  },

  /**
   * Quantitative 7-dimension sketch fidelity check
   */
  async checkFidelity(projectId: string) {
    return request<FidelityEvaluation>(`/projects/${projectId}/fidelity-check`, {
      method: 'POST',
    });
  },

  /**
   * Export as standalone React TSX string or Vite project ZIP blob
   */
  async exportProject(projectId: string, format: 'tsx' | 'zip', componentName?: string) {
    return request<{
      project_id: string;
      format: string;
      component_name: string;
      code?: string;
    } | Blob>(`/projects/${projectId}/export`, {
      method: 'POST',
      body: JSON.stringify({ format, component_name: componentName }),
    });
  },
};

