from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.interface import InterfaceDocument


class ProjectStatus(str, Enum):
    """Lifecycle status of a project."""
    DRAFT = "draft"
    ANALYZING = "analyzing"
    GENERATED = "generated"
    REVIEWED = "reviewed"


class ProjectCreateRequest(BaseModel):
    """Payload to initiate a new project generation from an uploaded sketch."""
    sketch_id: str = Field(..., description="ID of uploaded sketch file")
    title: Optional[str] = Field(default="Untitled Sketch Project")
    user_annotations: Optional[List[str]] = Field(default_factory=list)
    design_system: Optional[str] = Field(default="modern-dark")


class ProjectResponse(BaseModel):
    """Complete project record with sketch reference and interface document."""
    id: str
    title: str
    status: ProjectStatus
    sketch_id: str
    created_at: datetime
    updated_at: datetime
    node_count: int
    fidelity_score: Optional[float] = None
    interface: InterfaceDocument


class ProjectSummary(BaseModel):
    """Condensed project record for dashboard and history listings."""
    id: str
    title: str
    status: ProjectStatus
    sketch_id: str
    created_at: datetime
    updated_at: datetime
    node_count: int
    fidelity_score: Optional[float] = None


class ProjectRenameRequest(BaseModel):
    """Payload to rename an existing project."""
    title: str = Field(..., min_length=1, max_length=100, description="New project title")

