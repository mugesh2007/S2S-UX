from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.sketch import BoundingBoxNormalized


class FindingCategory(str, Enum):
    """The 7 analysis dimensions of sketch fidelity evaluation."""
    PRESENCE = "presence"
    ORDERING = "ordering"
    POSITION = "position"
    SIZE = "size"
    TEXT = "text"
    LAYOUT = "layout"
    ANNOTATION = "annotation"


class FindingSeverity(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class FidelityFinding(BaseModel):
    """Detailed diagnostic difference between the original sketch and generated UI."""
    model_config = ConfigDict(populate_by_name=True)

    finding_id: str = Field(..., alias="findingId")
    category: FindingCategory
    severity: FindingSeverity
    description: str
    original_sketch_evidence: Optional[str] = Field(default=None, alias="originalSketchEvidence")
    generated_interface_evidence: Optional[str] = Field(default=None, alias="generatedInterfaceEvidence")
    suggested_correction: Optional[str] = Field(default=None, alias="suggestedCorrection")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    uncertainty_note: Optional[str] = Field(default=None, alias="uncertaintyNote")
    target_element_id: Optional[str] = Field(default=None, alias="targetElementId")
    target_element_name: Optional[str] = Field(default=None, alias="targetElementName")
    bounding_box_sketch: Optional[BoundingBoxNormalized] = Field(default=None, alias="boundingBoxSketch")
    bounding_box_ast: Optional[BoundingBoxNormalized] = Field(default=None, alias="boundingBoxAst")
    status: str = Field(default="open")  # "open", "applied", "dismissed"


class DimensionScore(BaseModel):
    """Quantitative measurement for an individual analysis dimension."""
    model_config = ConfigDict(populate_by_name=True)

    dimension: str
    name: str
    score: Optional[float] = None  # None if dimension is unmeasured/unavailable
    is_measured: bool = Field(default=True, alias="isMeasured")
    weight: float = Field(default=0.0, ge=0.0, le=1.0)
    details: str
    findings_count: int = Field(default=0, alias="findingsCount")


class FidelityScoreBreakdown(BaseModel):
    """Mathematical formula and limitations documentation for the composite fidelity score."""
    model_config = ConfigDict(populate_by_name=True)

    formula: str
    limitations: List[str]
    dimensions: List[DimensionScore]
    measured_dimensions_count: int = Field(..., alias="measuredDimensionsCount")
    total_dimensions_count: int = Field(..., alias="totalDimensionsCount")


class FidelityMetricItem(BaseModel):
    """Legacy quantitative metric tier."""
    model_config = ConfigDict(populate_by_name=True)

    score: float = Field(..., ge=0.0, le=100.0)
    weight: float = Field(..., ge=0.0, le=1.0)
    details: str


class FidelityWarnings(BaseModel):
    """Categorized diagnostic warnings."""
    model_config = ConfigDict(populate_by_name=True)

    missing_components: List[str] = Field(default_factory=list, alias="missingComponents")
    layout_mismatches: List[str] = Field(default_factory=list, alias="layoutMismatches")
    uncertain_interpretations: List[str] = Field(default_factory=list, alias="uncertainInterpretations")


class SuggestedCorrection(BaseModel):
    """Actionable suggested adjustment to improve fidelity."""
    model_config = ConfigDict(populate_by_name=True)

    element_id: str = Field(..., alias="elementId")
    element_name: str = Field(..., alias="elementName")
    issue: str
    suggestion: str
    category: Optional[str] = "layout"
    suggested_patch: Optional[Dict[str, Any]] = Field(default=None, alias="suggestedPatch")


class FidelityMetrics(BaseModel):
    """Breakdown of measurement tiers for backwards compatibility."""
    model_config = ConfigDict(populate_by_name=True)

    layout_iou_score: FidelityMetricItem = Field(..., alias="layoutIoUScore")
    structural_edge_ssim: FidelityMetricItem = Field(..., alias="structuralEdgeSSIM")
    semantic_annotation_score: FidelityMetricItem = Field(..., alias="semanticAnnotationScore")


class FidelityReportResponse(BaseModel):
    """Complete quantitative fidelity audit report."""
    model_config = ConfigDict(populate_by_name=True)

    project_id: str = Field(..., alias="projectId")
    overall_score: Optional[float] = Field(default=None, ge=0.0, le=100.0, alias="overallScore")
    rating: str  # "high", "moderate", "low", "unrated"
    is_measured_cv: bool = Field(default=True, alias="isMeasuredCV")
    disclaimer: str
    score_breakdown: FidelityScoreBreakdown = Field(..., alias="scoreBreakdown")
    findings: List[FidelityFinding] = Field(default_factory=list)
    metrics: FidelityMetrics
    warnings: FidelityWarnings
    suggested_corrections: List[SuggestedCorrection] = Field(
        default_factory=list, alias="suggestedCorrections"
    )

