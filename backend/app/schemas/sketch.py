from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class PreprocessStrategy(str, Enum):
    """Supported computer vision preprocessing strategies."""
    NONE = "none"
    STANDARD_ENHANCE = "standard_enhance"
    ADAPTIVE_CLAHE = "adaptive_clahe"
    OTSU_BINARY = "otsu_binary"


class BoundingBoxNormalized(BaseModel):
    """Bounding box coordinates normalized to a [0, 1000] canvas grid."""
    x: int = Field(..., ge=0, le=1000, description="Top-left X coordinate")
    y: int = Field(..., ge=0, le=1000, description="Top-left Y coordinate")
    w: int = Field(..., ge=1, le=1000, description="Width of box")
    h: int = Field(..., ge=1, le=1000, description="Height of box")


class ContourDetectionItem(BaseModel):
    """Represents a visual element block detected via OpenCV."""
    id: str
    contour_index: int
    bounding_box: BoundingBoxNormalized
    area: float
    aspect_ratio: float
    confidence: float
    suggested_type: Optional[str] = None


class SketchUploadResponse(BaseModel):
    """Returned upon successful sketch image upload."""
    sketch_id: str
    filename: str
    mime_type: str
    file_size_bytes: int
    width: int
    height: int
    created_at: datetime


class SketchAnalysisRequest(BaseModel):
    """Parameters for preprocessing and contour extraction."""
    strategy: PreprocessStrategy = Field(
        default=PreprocessStrategy.ADAPTIVE_CLAHE,
        description="Preprocessing filter to apply before contour analysis."
    )
    user_annotations: Optional[List[str]] = Field(
        default=None,
        description="Optional handwritten notes or hints provided by user."
    )


class SketchAnalysisResponse(BaseModel):
    """Analysis results containing extracted contours and preprocessed metadata."""
    sketch_id: str
    strategy_applied: PreprocessStrategy
    detected_contours: List[ContourDetectionItem]
    detected_annotations: List[str]
    processing_time_ms: float
