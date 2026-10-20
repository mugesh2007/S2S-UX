from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from app.core.logging import logger


class S2SException(Exception):
    """Base exception for all S2S domain errors."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class ImageValidationError(S2SException):
    """Raised when an uploaded sketch fails validation."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="IMAGE_VALIDATION_ERROR",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details,
        )


class ProjectNotFoundError(S2SException):
    """Raised when a requested project does not exist."""

    def __init__(self, project_id: str):
        super().__init__(
            message=f"Project with ID '{project_id}' not found.",
            code="PROJECT_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"project_id": project_id},
        )


class SketchNotFoundError(S2SException):
    """Raised when a requested sketch does not exist."""

    def __init__(self, sketch_id: str):
        super().__init__(
            message=f"Sketch with ID '{sketch_id}' not found.",
            code="SKETCH_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"sketch_id": sketch_id},
        )


class ComponentNotFoundError(S2SException):
    """Raised when a specific component ID is not found in an interface tree."""

    def __init__(self, component_id: str, project_id: str):
        super().__init__(
            message=f"Component '{component_id}' not found in project '{project_id}'.",
            code="COMPONENT_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"component_id": component_id, "project_id": project_id},
        )


class InterfaceValidationError(S2SException):
    """Raised when an AST interface structure fails schema or depth validation."""

    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="INTERFACE_VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class AIProviderError(S2SException):
    """Raised when an AI provider fails during inference or schema return."""

    def __init__(
        self,
        message: str,
        code: str = "AI_PROVIDER_ERROR",
        status_code: int = status.HTTP_502_BAD_GATEWAY,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            code=code,
            status_code=status_code,
            details=details,
        )


def register_exception_handlers(app: FastAPI) -> None:
    """Registers standard, safe JSON error handlers across the FastAPI application."""

    @app.exception_handler(S2SException)
    async def s2s_exception_handler(request: Request, exc: S2SException):
        logger.warning(
            f"Domain error [{exc.code}] at {request.method} {request.url.path}: {exc.message}"
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                },
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(
            f"Unhandled server error at {request.method} {request.url.path}: {str(exc)}",
            exc_info=True,
        )
        # Never expose internal stack traces or database info to users in production
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred while processing your request. Please try again later.",
                },
            },
        )
