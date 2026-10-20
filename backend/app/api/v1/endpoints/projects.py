from typing import List
from fastapi import APIRouter, Response, status
from fastapi.responses import Response

from app.schemas.component import ComponentAddRequest, ComponentEditRequest
from app.schemas.correction import NaturalCorrectionRequest, NaturalCorrectionResponse
from app.schemas.export import ExportCodeResponse, ExportFormat, ExportRequest
from app.schemas.fidelity import FidelityReportResponse
from app.schemas.interface import InterfaceUpdateRequest
from app.schemas.project import (
    ProjectCreateRequest,
    ProjectRenameRequest,
    ProjectResponse,
    ProjectSummary,
)
from app.services.code_generator import code_generator
from app.services.fidelity_service import fidelity_service
from app.services.project_service import project_service

router = APIRouter()


@router.post(
    "/projects/generate",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate Project from Sketch",
)
def generate_project(payload: ProjectCreateRequest):
    """
    Initiates multimodal sketch interpretation and generates a validated React UI AST tree.
    """
    return project_service.create_project(payload)


@router.get(
    "/projects",
    response_model=List[ProjectSummary],
    summary="List All Projects",
)
def list_projects():
    """Returns summaries of all projects in workspace for dashboard and history."""
    return project_service.list_projects()


@router.get(
    "/projects/{project_id}",
    response_model=ProjectResponse,
    summary="Get Project Details",
)
def get_project(project_id: str):
    """Retrieves full project details including the active UI AST tree."""
    return project_service.get_project(project_id)


@router.patch(
    "/projects/{project_id}/rename",
    response_model=ProjectResponse,
    summary="Rename Project",
)
def rename_project(project_id: str, payload: ProjectRenameRequest):
    """Updates project title and persists changes to SQLite."""
    return project_service.rename_project(project_id, payload.title)


@router.delete(
    "/projects/{project_id}",
    summary="Delete Project",
)
def delete_project(project_id: str):
    """Deletes project from active workspace and SQLite storage."""
    project_service.delete_project(project_id)
    return {"success": True, "message": f"Project '{project_id}' deleted successfully"}


@router.put(
    "/projects/{project_id}/interface",
    response_model=ProjectResponse,
    summary="Update Project Interface AST",
)
def update_project_interface(project_id: str, payload: InterfaceUpdateRequest):
    """Replaces the entire UI AST with schema validation."""
    return project_service.update_interface(project_id, payload.interface)


@router.post(
    "/projects/{project_id}/components/{component_id}/edit",
    response_model=ProjectResponse,
    summary="Edit Specific Component in AST",
)
def edit_project_component(
    project_id: str, component_id: str, payload: ComponentEditRequest
):
    """Updates props, styles, or name of a single component node within the project AST."""
    return project_service.edit_component(project_id, component_id, payload)


@router.post(
    "/projects/{project_id}/components/{component_id}/duplicate",
    response_model=ProjectResponse,
    summary="Duplicate Component in AST",
)
def duplicate_project_component(project_id: str, component_id: str):
    """Duplicates a component node with a fresh ID without full page regeneration."""
    return project_service.duplicate_component(project_id, component_id)


@router.delete(
    "/projects/{project_id}/components/{component_id}",
    response_model=ProjectResponse,
    summary="Delete Component from AST",
)
def delete_project_component(project_id: str, component_id: str):
    """Deletes a component node from its parent container in the AST."""
    return project_service.delete_component(project_id, component_id)


@router.post(
    "/projects/{project_id}/components/{parent_id}/children",
    response_model=ProjectResponse,
    summary="Add Component to Parent Container",
)
def add_project_component(
    project_id: str, parent_id: str, payload: ComponentAddRequest
):
    """Appends a new child component node to a container in the AST."""
    return project_service.add_component(project_id, parent_id, payload.component)


@router.post(
    "/projects/{project_id}/corrections/natural",
    response_model=NaturalCorrectionResponse,
    summary="Apply Natural Language Correction",
)
def apply_natural_correction(project_id: str, payload: NaturalCorrectionRequest):
    """
    Translates user prompt (e.g. 'Make the login button blue') into a validated AST mutation.
    """
    return project_service.apply_natural_correction(project_id, payload)


@router.post(
    "/projects/{project_id}/fidelity-check",
    response_model=FidelityReportResponse,
    summary="Evaluate Sketch Fidelity",
)
def check_project_fidelity(project_id: str):
    """
    Evaluates multi-tier quantitative fidelity (IoU layout bounding boxes, edge SSIM, and semantic annotations).
    """
    return fidelity_service.evaluate_project_fidelity(project_id)


@router.post(
    "/projects/{project_id}/export",
    summary="Export Project as React TSX or ZIP",
)
def export_project(project_id: str, payload: ExportRequest = ExportRequest()):
    """
    Compiles the project AST into either:
    1. Standalone React TSX component code string.
    2. Complete production Vite + React + Tailwind CSS downloadable ZIP package.
    """
    project = project_service.get_project(project_id)
    comp_name = payload.component_name or project.title or "GeneratedScreen"

    if payload.format == ExportFormat.ZIP:
        zip_bytes = code_generator.generate_project_zip(
            project.interface, component_name=comp_name
        )
        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{comp_name.lower()}-project.zip"'
            },
        )

    # Default standalone TSX code string
    tsx_code = code_generator.compile_to_tsx(
        project.interface, component_name=comp_name
    )
    return ExportCodeResponse(
        componentName=comp_name,
        code=tsx_code,
        format="tsx",
        dependencies={
            "react": "^18.3.1",
            "tailwindcss": "^3.4.13",
            "lucide-react": "^0.447.0",
        },
    )
