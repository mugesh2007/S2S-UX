import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional
from app.core.config import settings
from app.core.logging import logger
from app.schemas.interface import InterfaceDocument
from app.schemas.project import ProjectStatus


class SQLiteProjectRepository:
    """
    Isolated SQLite data-access layer for project persistence and version history.
    Keeps database queries strictly decoupled from FastAPI route handlers.
    """

    def __init__(self, db_path: Optional[Path] = None):
        if db_path:
            self._db_path = db_path
        else:
            data_dir = getattr(settings, "DATA_DIR", Path("/tmp/s2s_data"))
            data_dir.mkdir(parents=True, exist_ok=True)
            self._db_path = data_dir / "sketch2screen.db"

        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self._db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        """Initializes the projects schema if it does not exist."""
        with self._get_connection() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    sketch_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    interface_json TEXT NOT NULL,
                    fidelity_score REAL
                );
                """
            )
            conn.commit()
            logger.info(f"Initialized SQLite Project Repository at {self._db_path}")

    def save(
        self,
        project_id: str,
        title: str,
        sketch_id: str,
        status: ProjectStatus,
        created_at: datetime,
        updated_at: datetime,
        interface: InterfaceDocument,
        fidelity_score: Optional[float] = None,
    ) -> None:
        """Saves or updates a project record in the SQLite database."""
        interface_json = interface.model_dump_json(by_alias=True)
        created_iso = created_at.isoformat()
        updated_iso = updated_at.isoformat()
        status_str = status.value if hasattr(status, "value") else str(status)

        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO projects (id, title, sketch_id, status, created_at, updated_at, interface_json, fidelity_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    title=excluded.title,
                    status=excluded.status,
                    updated_at=excluded.updated_at,
                    interface_json=excluded.interface_json,
                    fidelity_score=excluded.fidelity_score;
                """,
                (
                    project_id,
                    title,
                    sketch_id,
                    status_str,
                    created_iso,
                    updated_iso,
                    interface_json,
                    fidelity_score,
                ),
            )
            conn.commit()

    def get(self, project_id: str) -> Optional[Dict]:
        """Retrieves raw project row by ID."""
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT id, title, sketch_id, status, created_at, updated_at, interface_json, fidelity_score FROM projects WHERE id = ?",
                (project_id,),
            )
            row = cursor.fetchone()
            if not row:
                return None
            return dict(row)

    def list_all(self) -> List[Dict]:
        """Lists all stored projects ordered by updated_at descending."""
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT id, title, sketch_id, status, created_at, updated_at, interface_json, fidelity_score FROM projects ORDER BY updated_at DESC"
            )
            return [dict(r) for r in cursor.fetchall()]

    def rename(self, project_id: str, new_title: str) -> bool:
        """Updates a project's title and updated_at timestamp."""
        now_iso = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            cursor = conn.execute(
                "UPDATE projects SET title = ?, updated_at = ? WHERE id = ?",
                (new_title, now_iso, project_id),
            )
            conn.commit()
            return cursor.rowcount > 0

    def delete(self, project_id: str) -> bool:
        """Deletes a project record from SQLite."""
        with self._get_connection() as conn:
            cursor = conn.execute("DELETE FROM projects WHERE id = ?", (project_id,))
            conn.commit()
            return cursor.rowcount > 0


project_repository = SQLiteProjectRepository()
