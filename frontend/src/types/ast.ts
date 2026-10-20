/**
 * S2S UI Abstract Syntax Tree (AST) Type Definitions
 * Strictly defines allowlisted components, normalized coordinates, and attributes.
 */

export type ComponentType =
  | 'Container'
  | 'Navbar'
  | 'Card'
  | 'Button'
  | 'Input'
  | 'Heading'
  | 'Text'
  | 'Table'
  | 'Badge'
  | 'Avatar'
  | 'Checkbox'
  | 'ImagePlaceholder'
  | 'Divider';

export interface BoundingBoxNormalized {
  x: number; // 0 to 1000 coordinate system
  y: number; // 0 to 1000
  w: number; // 0 to 1000
  h: number; // 0 to 1000
}

export interface S2SNode {
  id: string;
  type: ComponentType;
  name: string;
  props: Record<string, any>;
  styles: {
    tailwindClasses?: string;
    customStyles?: Record<string, string>;
  };
  boundingBox?: BoundingBoxNormalized;
  annotations?: string[];
  children?: S2SNode[];
}

export interface S2SNodeTree extends S2SNode {
  type: 'Container';
  meta: {
    version: '1.0.0';
    createdAt: string;
    title: string;
    designSystem: 'modern-dark' | 'clean-light' | 'corporate';
    targetViewport: {
      width: number;
      height: number;
    };
  };
}

export interface DetectedAnnotation {
  id: string;
  text: string;
  boundingBox?: BoundingBoxNormalized;
  targetElementId?: string;
  confidence: number;
  category: 'label' | 'instruction' | 'style' | 'layout';
}

export interface FidelityMetricItem {
  score: number;
  weight: number;
  details: string;
}

export type FindingCategory =
  | 'presence'
  | 'ordering'
  | 'position'
  | 'size'
  | 'text'
  | 'layout'
  | 'annotation';

export type FindingSeverity = 'high' | 'medium' | 'low' | 'info';

export interface FidelityFinding {
  findingId: string;
  category: FindingCategory;
  severity: FindingSeverity;
  description: string;
  originalSketchEvidence?: string;
  generatedInterfaceEvidence?: string;
  suggestedCorrection?: string;
  confidence: number;
  uncertaintyNote?: string;
  targetElementId?: string;
  targetElementName?: string;
  boundingBoxSketch?: BoundingBoxNormalized;
  boundingBoxAst?: BoundingBoxNormalized;
  status: 'open' | 'applied' | 'dismissed';
}

export interface DimensionScore {
  dimension: string;
  name: string;
  score: number | null;
  isMeasured: boolean;
  weight: number;
  details: string;
  findingsCount: number;
}

export interface FidelityScoreBreakdown {
  formula: string;
  limitations: string[];
  dimensions: DimensionScore[];
  measuredDimensionsCount: number;
  totalDimensionsCount: number;
}

export interface FidelityEvaluation {
  overallScore: number;
  rating: 'high' | 'moderate' | 'low';
  disclaimer: string;
  isMeasuredCV: boolean;
  scoreBreakdown?: FidelityScoreBreakdown;
  findings?: FidelityFinding[];
  metrics: {
    layoutIoUScore: FidelityMetricItem;
    structuralEdgeSSIM: FidelityMetricItem;
    semanticAnnotationScore: FidelityMetricItem;
  };
  warnings: {
    missingComponents: string[];
    layoutMismatches: string[];
    uncertainInterpretations: string[];
  };
  suggestedCorrections: {
    elementId: string;
    elementName: string;
    issue: string;
    suggestion: string;
    category?: string;
  }[];
}

export interface ProjectMetadata {
  id: string;
  title: string;
  thumbnailUrl?: string;
  sketchUrl?: string;
  sketch_id?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  status: 'draft' | 'analyzing' | 'generated' | 'reviewed';
  nodeCount?: number;
  node_count?: number;
  fidelityScore?: number;
  fidelity_score?: number;
}

