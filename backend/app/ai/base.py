from abc import ABC, abstractmethod
from typing import List, Optional
from app.schemas.interface import InterfaceDocument


class IVLMProvider(ABC):
    """Abstract interface defining the contract for all Vision-Language Model providers."""

    @abstractmethod
    def generate_interface(
        self,
        image_bytes: bytes,
        user_annotations: Optional[List[str]] = None,
        design_system: str = "modern-dark",
        title: Optional[str] = None,
    ) -> InterfaceDocument:
        """
        Converts sketch bytes and optional user notes into a validated InterfaceDocument AST.
        """
        pass

    @abstractmethod
    def health_check(self) -> dict:
        """Returns provider availability and operational metadata."""
        pass
