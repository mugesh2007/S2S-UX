from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.component import UIComponentNode
from app.core.exceptions import InterfaceValidationError


class ProposedAnnotationChange(BaseModel):
    """Represents an interpretation of a handwritten note/arrow as a candidate modification."""
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., description="Unique proposal identifier")
    raw_annotation: str = Field(..., alias="rawAnnotation", description="Original note text extracted from sketch")
    target_element_id: Optional[str] = Field(default=None, alias="targetElementId")
    action_type: str = Field(
        default="style_change",
        alias="actionType",
        description="Type of modification (e.g. style_change, layout_shift, insert_component)",
    )
    explanation: str = Field(..., description="Why and how this change was derived from visible evidence")
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    is_applied: bool = Field(
        default=False,
        alias="isApplied",
        description="False by default so uncertain instructions are not applied silently",
    )
    proposed_properties: Optional[Dict[str, Any]] = Field(default=None, alias="proposedProperties")


class InterfaceMeta(BaseModel):
    """Metadata describing the target framework, design system, and AI interpretation telemetry."""
    model_config = ConfigDict(populate_by_name=True)

    version: str = "1.0.0"
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="createdAt"
    )
    title: str = "Generated Screen"
    page_type: str = Field(default="dashboard", alias="pageType", description="Inferred screen archetype")
    design_system: str = Field(default="modern-dark", alias="designSystem")
    target_viewport: Dict[str, int] = Field(
        default_factory=lambda: {"width": 1280, "height": 800},
        alias="targetViewport",
    )
    ai_provider: str = Field(default="mock", alias="aiProvider", description="Name of VLM provider used")
    model_used: Optional[str] = Field(default=None, alias="modelUsed")
    is_mock: bool = Field(default=False, alias="isMock", description="Explicit flag indicating mock/deterministic generation")
    proposed_changes: List[ProposedAnnotationChange] = Field(
        default_factory=list,
        alias="proposedChanges",
        description="Candidate changes derived from handwritten annotations",
    )
    uncertain_elements: List[str] = Field(
        default_factory=list,
        alias="uncertainElements",
        description="IDs of elements marked as uncertain",
    )


class InterfaceDocument(UIComponentNode):
    """Complete interface AST document containing root container and metadata."""
    meta: InterfaceMeta = Field(default_factory=InterfaceMeta)

    @model_validator(mode="after")
    def validate_ast_tree(self) -> "InterfaceDocument":
        """Enforces recursion limits and prevents circular node structures."""
        max_depth = 12

        def check_depth(node: UIComponentNode, current_depth: int):
            if current_depth > max_depth:
                raise InterfaceValidationError(
                    f"AST nesting depth exceeded safety maximum of {max_depth} levels."
                )
            if node.children:
                for child in node.children:
                    check_depth(child, current_depth + 1)

        check_depth(self, 1)
        return self


class InterfaceUpdateRequest(BaseModel):
    """Payload to replace or update an entire interface document."""
    interface: InterfaceDocument
