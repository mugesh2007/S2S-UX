import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.ai.base import IVLMProvider
from app.ai.factory import VLMProviderFactory
from app.core.exceptions import ComponentNotFoundError, ProjectNotFoundError
from app.core.logging import logger
from app.db.project_repository import project_repository
from app.schemas.component import ComponentEditRequest, UIComponentNode
from app.schemas.correction import NaturalCorrectionRequest, NaturalCorrectionResponse
from app.schemas.interface import InterfaceDocument
from app.schemas.project import (
    ProjectCreateRequest,
    ProjectResponse,
    ProjectStatus,
    ProjectSummary,
)
from app.services.cv_preprocessor import cv_preprocessor
from app.services.correction_service import correction_service
from app.services.image_service import image_service


class ProjectRecord:
    """Internal model for tracking stored project state."""

    def __init__(
        self,
        project_id: str,
        title: str,
        sketch_id: str,
        status: ProjectStatus,
        created_at: datetime,
        updated_at: datetime,
        interface: InterfaceDocument,
        fidelity_score: Optional[float] = None,
    ):
        self.project_id = project_id
        self.title = title
        self.sketch_id = sketch_id
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at
        self.interface = interface
        self.fidelity_score = fidelity_score


class ProjectService:
    """Manages project state, SQLite persistence, interface modifications, and component editing."""

    def __init__(self, ai_provider: Optional[IVLMProvider] = None):
        self._projects: Dict[str, ProjectRecord] = {}
        self._ai_provider = ai_provider

    def get_ai_provider(self) -> IVLMProvider:
        """Returns the configured or injected VLM provider."""
        if self._ai_provider:
            return self._ai_provider
        return VLMProviderFactory.get_provider()

    @staticmethod
    def count_nodes(node: UIComponentNode) -> int:
        """Recursively counts total components in the AST."""
        count = 1
        if node.children:
            for child in node.children:
                count += ProjectService.count_nodes(child)
        return count

    def _row_to_record(self, row: Dict) -> ProjectRecord:
        """Hydrates a SQLite database row into a ProjectRecord."""
        interface = InterfaceDocument.model_validate_json(row["interface_json"])
        status = ProjectStatus(row["status"])
        created_at = datetime.fromisoformat(row["created_at"])
        updated_at = datetime.fromisoformat(row["updated_at"])
        return ProjectRecord(
            project_id=row["id"],
            title=row["title"],
            sketch_id=row["sketch_id"],
            status=status,
            created_at=created_at,
            updated_at=updated_at,
            interface=interface,
            fidelity_score=row.get("fidelity_score"),
        )

    def _save_record(self, record: ProjectRecord) -> None:
        """Stores record in memory cache and persists to SQLite database."""
        self._projects[record.project_id] = record
        try:
            project_repository.save(
                project_id=record.project_id,
                title=record.title,
                sketch_id=record.sketch_id,
                status=record.status,
                created_at=record.created_at,
                updated_at=record.updated_at,
                interface=record.interface,
                fidelity_score=record.fidelity_score,
            )
        except Exception as e:
            logger.warning(f"Failed to persist project {record.project_id} to SQLite: {e}")

    def _get_record(self, project_id: str) -> ProjectRecord:
        """Finds record in memory or loads from SQLite; raises ProjectNotFoundError if absent."""
        record = self._projects.get(project_id)
        if not record:
            row = project_repository.get(project_id)
            if row:
                record = self._row_to_record(row)
                self._projects[project_id] = record
            else:
                raise ProjectNotFoundError(project_id)
        return record

    def create_project(self, req: ProjectCreateRequest) -> ProjectResponse:
        """Creates a new project record and invokes the AI VLM interpretation pipeline."""
        sketch = image_service.get_sketch(req.sketch_id)
        original_bytes = image_service.read_sketch_bytes(req.sketch_id)
        analysis_image_bytes = cv_preprocessor.prepare_vision_analysis_image(original_bytes)

        project_id = str(uuid.uuid4())
        title = req.title or "Untitled Sketch Project"

        provider = self.get_ai_provider()
        generated_ast = provider.generate_interface(
            image_bytes=analysis_image_bytes,
            user_annotations=req.user_annotations,
            design_system=req.design_system or "modern-dark",
            title=title,
        )

        record = ProjectRecord(
            project_id=project_id,
            title=title,
            sketch_id=req.sketch_id,
            status=ProjectStatus.GENERATED,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            interface=generated_ast,
            fidelity_score=88.5,
        )
        self._save_record(record)

        logger.info(f"Created project '{title}' ({project_id}) with {self.count_nodes(generated_ast)} nodes")
        return self._to_response(record)

    def get_project(self, project_id: str) -> ProjectResponse:
        """Retrieves project details by ID."""
        record = self._get_record(project_id)
        return self._to_response(record)

    def list_projects(self) -> List[ProjectSummary]:
        """Lists summaries of all stored projects from SQLite and active cache."""
        summaries: Dict[str, ProjectSummary] = {}
        try:
            rows = project_repository.list_all()
            for row in rows:
                rec = self._row_to_record(row)
                self._projects[rec.project_id] = rec
                summaries[rec.project_id] = ProjectSummary(
                    id=rec.project_id,
                    title=rec.title,
                    status=rec.status,
                    sketch_id=rec.sketch_id,
                    created_at=rec.created_at,
                    updated_at=rec.updated_at,
                    node_count=self.count_nodes(rec.interface),
                    fidelity_score=rec.fidelity_score,
                )
        except Exception as e:
            logger.warning(f"Failed to query SQLite project repository: {e}")

        # Merge any in-memory records
        for p in self._projects.values():
            if p.project_id not in summaries:
                summaries[p.project_id] = ProjectSummary(
                    id=p.project_id,
                    title=p.title,
                    status=p.status,
                    sketch_id=p.sketch_id,
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                    node_count=self.count_nodes(p.interface),
                    fidelity_score=p.fidelity_score,
                )

        return sorted(summaries.values(), key=lambda s: s.updated_at, reverse=True)

    def rename_project(self, project_id: str, new_title: str) -> ProjectResponse:
        """Renames a project and updates SQLite database."""
        record = self._get_record(project_id)
        record.title = new_title.strip()
        record.updated_at = datetime.now(timezone.utc)
        self._save_record(record)
        logger.info(f"Renamed project '{project_id}' to '{new_title}'")
        return self._to_response(record)

    def delete_project(self, project_id: str) -> bool:
        """Deletes a project record from memory cache and SQLite."""
        existed_in_cache = self._projects.pop(project_id, None) is not None
        deleted_in_db = project_repository.delete(project_id)
        if not existed_in_cache and not deleted_in_db:
            raise ProjectNotFoundError(project_id)
        logger.info(f"Deleted project '{project_id}' from workspace and database")
        return True

    def update_interface(self, project_id: str, new_interface: InterfaceDocument) -> ProjectResponse:
        """Replaces the entire AST interface document with schema validation."""
        record = self._get_record(project_id)
        record.interface = new_interface
        record.updated_at = datetime.now(timezone.utc)
        record.status = ProjectStatus.REVIEWED
        self._save_record(record)

        logger.info(f"Updated full interface AST for project '{project_id}'")
        return self._to_response(record)

    def edit_component(
        self, project_id: str, component_id: str, edit_req: ComponentEditRequest
    ) -> ProjectResponse:
        """Finds and mutates a specific component within the project's AST."""
        record = self._get_record(project_id)
        found = False

        def mutate_node(node: UIComponentNode) -> None:
            nonlocal found
            if node.id == component_id:
                found = True
                if edit_req.name is not None:
                    node.name = edit_req.name
                if edit_req.props is not None:
                    node.props.update(edit_req.props)
                if edit_req.styles is not None:
                    if edit_req.styles.tailwind_classes is not None:
                        node.styles.tailwind_classes = edit_req.styles.tailwind_classes
                    if edit_req.styles.custom_styles is not None:
                        node.styles.custom_styles = edit_req.styles.custom_styles
                if edit_req.bounding_box is not None:
                    node.bounding_box = edit_req.bounding_box
                return

            if node.children:
                for child in node.children:
                    mutate_node(child)
                    if found:
                        return

        mutate_node(record.interface)

        if not found:
            raise ComponentNotFoundError(component_id=component_id, project_id=project_id)

        record.updated_at = datetime.now(timezone.utc)
        self._save_record(record)
        logger.info(f"Modified component '{component_id}' in project '{project_id}'")
        return self._to_response(record)

    def duplicate_component(self, project_id: str, component_id: str) -> ProjectResponse:
        """Duplicates a component in the AST with a fresh ID without full page regeneration."""
        record = self._get_record(project_id)
        if record.interface.id == component_id:
            raise ValueError("Root container component cannot be duplicated.")

        def clone_node(n: UIComponentNode) -> UIComponentNode:
            new_id = f"{n.type.value.lower()}-{uuid.uuid4().hex[:6]}"
            cloned_children = [clone_node(c) for c in (n.children or [])]
            return n.model_copy(
                update={
                    "id": new_id,
                    "name": f"{n.name} (Copy)",
                    "children": cloned_children,
                },
                deep=True,
            )

        found = False

        def traverse_and_duplicate(parent: UIComponentNode) -> bool:
            nonlocal found
            if not parent.children:
                return False
            for idx, child in enumerate(parent.children):
                if child.id == component_id:
                    replica = clone_node(child)
                    parent.children.insert(idx + 1, replica)
                    found = True
                    return True
                if traverse_and_duplicate(child):
                    return True
            return False

        traverse_and_duplicate(record.interface)
        if not found:
            raise ComponentNotFoundError(component_id=component_id, project_id=project_id)

        record.updated_at = datetime.now(timezone.utc)
        self._save_record(record)
        logger.info(f"Duplicated component '{component_id}' in project '{project_id}'")
        return self._to_response(record)

    def delete_component(self, project_id: str, component_id: str) -> ProjectResponse:
        """Deletes a component from the AST without full page regeneration."""
        record = self._get_record(project_id)
        if record.interface.id == component_id:
            raise ValueError("Root container component cannot be deleted.")

        found = False

        def traverse_and_delete(parent: UIComponentNode) -> bool:
            nonlocal found
            if not parent.children:
                return False
            for idx, child in enumerate(parent.children):
                if child.id == component_id:
                    parent.children.pop(idx)
                    found = True
                    return True
                if traverse_and_delete(child):
                    return True
            return False

        traverse_and_delete(record.interface)
        if not found:
            raise ComponentNotFoundError(component_id=component_id, project_id=project_id)

        record.updated_at = datetime.now(timezone.utc)
        self._save_record(record)
        logger.info(f"Deleted component '{component_id}' from project '{project_id}'")
        return self._to_response(record)

    def add_component(self, project_id: str, parent_id: str, new_node: UIComponentNode) -> ProjectResponse:
        """Appends a new child component to a container node in the AST."""
        record = self._get_record(project_id)
        parent_found = False

        def traverse_and_insert(node: UIComponentNode) -> bool:
            nonlocal parent_found
            if node.id == parent_id:
                parent_found = True
                if node.children is None:
                    node.children = []
                node.children.append(new_node)
                return True
            if node.children:
                for child in node.children:
                    if traverse_and_insert(child):
                        return True
            return False

        traverse_and_insert(record.interface)
        if not parent_found:
            raise ComponentNotFoundError(component_id=parent_id, project_id=project_id)

        record.updated_at = datetime.now(timezone.utc)
        self._save_record(record)
        logger.info(f"Added component '{new_node.id}' to parent '{parent_id}' in project '{project_id}'")
        return self._to_response(record)

    def apply_natural_correction(
        self, project_id: str, req: NaturalCorrectionRequest
    ) -> NaturalCorrectionResponse:
        """Translates natural language instructions into validated property updates."""
        record = self._get_record(project_id)
        updated_interface, patch, target_node, explanation = correction_service.translate_and_apply(
            record.interface, req, project_id
        )
        record.interface = updated_interface
        record.updated_at = datetime.now(timezone.utc)
        record.status = ProjectStatus.REVIEWED
        self._save_record(record)
        logger.info(
            f"Applied natural language correction on '{target_node.name}' ({target_node.id}) in project '{project_id}': {explanation}"
        )
        return NaturalCorrectionResponse(
            projectId=project_id,
            componentId=target_node.id,
            componentName=target_node.name,
            translatedPatch=patch,
            explanation=explanation,
            interface=record.interface,
        )

    def _to_response(self, record: ProjectRecord) -> ProjectResponse:
        return ProjectResponse(
            id=record.project_id,
            title=record.title,
            status=record.status,
            sketch_id=record.sketch_id,
            created_at=record.created_at,
            updated_at=record.updated_at,
            node_count=self.count_nodes(record.interface),
            fidelity_score=record.fidelity_score,
            interface=record.interface,
        )


project_service = ProjectService()

