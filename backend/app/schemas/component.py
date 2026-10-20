from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.sketch import BoundingBoxNormalized


class ComponentType(str, Enum):
    """Allowlisted component types that can be rendered or exported."""
    CONTAINER = "Container"
    NAVBAR = "Navbar"
    CARD = "Card"
    BUTTON = "Button"
    INPUT = "Input"
    HEADING = "Heading"
    TEXT = "Text"
    TABLE = "Table"
    BADGE = "Badge"
    AVATAR = "Avatar"
    CHECKBOX = "Checkbox"
    IMAGE_PLACEHOLDER = "ImagePlaceholder"
    DIVIDER = "Divider"


class ComponentStyles(BaseModel):
    """Tailwind tokens and custom style properties."""
    model_config = ConfigDict(populate_by_name=True)

    tailwind_classes: Optional[str] = Field(default=None, alias="tailwindClasses")
    custom_styles: Optional[Dict[str, str]] = Field(default=None, alias="customStyles")


class UIComponentNode(BaseModel):
    """A single node within the S2S UI AST tree."""
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., description="Unique element identifier")
    type: ComponentType = Field(..., description="Allowlisted UI element type")
    name: str = Field(default="Element", description="Human-readable layer name")

    @field_validator("type", mode="before")
    @classmethod
    def normalize_component_type(cls, v: Any) -> Any:
        if isinstance(v, str):
            mapping = {
                "textinput": ComponentType.INPUT,
                "text input": ComponentType.INPUT,
                "navigationbar": ComponentType.NAVBAR,
                "navigation bar": ComponentType.NAVBAR,
                "navigation": ComponentType.NAVBAR,
                "navbar": ComponentType.NAVBAR,
                "image": ComponentType.IMAGE_PLACEHOLDER,
                "image placeholder": ComponentType.IMAGE_PLACEHOLDER,
                "imageplaceholder": ComponentType.IMAGE_PLACEHOLDER,
                "header": ComponentType.HEADING,
                "heading": ComponentType.HEADING,
                "button": ComponentType.BUTTON,
                "card": ComponentType.CARD,
                "container": ComponentType.CONTAINER,
                "text": ComponentType.TEXT,
                "table": ComponentType.TABLE,
                "badge": ComponentType.BADGE,
                "avatar": ComponentType.AVATAR,
                "checkbox": ComponentType.CHECKBOX,
                "divider": ComponentType.DIVIDER,
            }
            clean_v = v.strip().lower()
            if clean_v in mapping:
                return mapping[clean_v]
        return v
    props: Dict[str, Any] = Field(default_factory=dict, description="Component-specific properties")
    styles: ComponentStyles = Field(default_factory=ComponentStyles)
    bounding_box: Optional[BoundingBoxNormalized] = Field(default=None, alias="boundingBox")
    text_content: Optional[str] = Field(default=None, alias="textContent", description="Extracted visible text")
    is_uncertain: bool = Field(default=False, alias="isUncertain", description="True if component type or intent was ambiguous")
    uncertainty_reason: Optional[str] = Field(default=None, alias="uncertaintyReason")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Detection and classification confidence")
    annotations: Optional[List[str]] = Field(default=None, description="Handwritten notes bound to this node")
    interpretation_notes: Optional[List[str]] = Field(default=None, alias="interpretationNotes")
    children: Optional[List["UIComponentNode"]] = Field(default_factory=list)


class ComponentEditRequest(BaseModel):
    """Payload to modify an existing component in the tree."""
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = None
    props: Optional[Dict[str, Any]] = None
    styles: Optional[ComponentStyles] = None
    bounding_box: Optional[BoundingBoxNormalized] = Field(default=None, alias="boundingBox")
    is_uncertain: Optional[bool] = Field(default=None, alias="isUncertain")


class ComponentAddRequest(BaseModel):
    """Payload to append a new component node to a container."""
    model_config = ConfigDict(populate_by_name=True)

    component: UIComponentNode


# Resolve self-referencing forward declaration for children nodes
UIComponentNode.model_rebuild()

