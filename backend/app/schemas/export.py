from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ExportFormat(str, Enum):
    """Format for exported React code."""
    TSX = "tsx"
    ZIP = "zip"


class ExportRequest(BaseModel):
    """Request payload for exporting a project."""
    model_config = ConfigDict(populate_by_name=True)

    format: ExportFormat = Field(default=ExportFormat.TSX)
    component_name: Optional[str] = Field(default=None, alias="componentName")


class ExportCodeResponse(BaseModel):
    """Returned when exporting as standalone TSX string."""
    model_config = ConfigDict(populate_by_name=True)

    component_name: str = Field(..., alias="componentName")
    code: str
    format: str = "tsx"
    dependencies: dict
