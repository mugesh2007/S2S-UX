from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.interface import InterfaceDocument


class NaturalCorrectionRequest(BaseModel):
    """Payload for natural-language component corrections."""
    model_config = ConfigDict(populate_by_name=True)

    prompt: str = Field(..., min_length=2, max_length=500, description="Natural language prompt, e.g. 'Make the login button blue'")
    component_id: Optional[str] = Field(default=None, alias="componentId", description="Target component ID if already selected")


class NaturalCorrectionResponse(BaseModel):
    """Response returned when a natural language edit is translated and applied."""
    model_config = ConfigDict(populate_by_name=True)

    project_id: str = Field(..., alias="projectId")
    component_id: str = Field(..., alias="componentId")
    component_name: str = Field(..., alias="componentName")
    translated_patch: Dict[str, Any] = Field(..., alias="translatedPatch")
    explanation: str
    interface: InterfaceDocument
