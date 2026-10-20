import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Optional
from app.core.config import settings
from app.core.exceptions import SketchNotFoundError
from app.core.logging import logger
from app.core.security import (
    generate_secure_filename,
    sanitize_and_validate_path,
    validate_image_bytes,
)
from app.schemas.sketch import SketchUploadResponse


class SketchRecord:
    """Internal metadata for a stored sketch image."""

    def __init__(
        self,
        sketch_id: str,
        filename: str,
        filepath: Path,
        mime_type: str,
        file_size_bytes: int,
        width: int,
        height: int,
        created_at: datetime,
    ):
        self.sketch_id = sketch_id
        self.filename = filename
        self.filepath = filepath
        self.mime_type = mime_type
        self.file_size_bytes = file_size_bytes
        self.width = width
        self.height = height
        self.created_at = created_at


class ImageService:
    """Manages secure sketch storage, retrieval, and metadata indexing."""

    def __init__(self):
        self._sketches: Dict[str, SketchRecord] = {}
        self._upload_dir = settings.get_upload_dir()

    def store_sketch(self, content: bytes, original_filename: Optional[str] = None) -> SketchUploadResponse:
        """
        Validates content bytes, writes to a secure UUID file, and registers the sketch.
        """
        # Validate bytes and format
        mime_type, width, height = validate_image_bytes(content)

        sketch_id = str(uuid.uuid4())
        safe_filename = generate_secure_filename(mime_type)
        target_path = sanitize_and_validate_path(
            self._upload_dir / safe_filename, self._upload_dir
        )

        # Write image bytes securely
        with open(target_path, "wb") as f:
            f.write(content)

        record = SketchRecord(
            sketch_id=sketch_id,
            filename=safe_filename,
            filepath=target_path,
            mime_type=mime_type,
            file_size_bytes=len(content),
            width=width,
            height=height,
            created_at=datetime.now(timezone.utc),
        )
        self._sketches[sketch_id] = record

        logger.info(
            f"Stored sketch {sketch_id} ({width}x{height}, {len(content)} bytes) as {safe_filename}"
        )

        return SketchUploadResponse(
            sketch_id=record.sketch_id,
            filename=record.filename,
            mime_type=record.mime_type,
            file_size_bytes=record.file_size_bytes,
            width=record.width,
            height=record.height,
            created_at=record.created_at,
        )

    def get_sketch(self, sketch_id: str) -> SketchRecord:
        """Retrieves sketch metadata by ID."""
        record = self._sketches.get(sketch_id)
        if not record or not record.filepath.exists():
            raise SketchNotFoundError(sketch_id)
        return record

    def read_sketch_bytes(self, sketch_id: str) -> bytes:
        """Reads the raw image bytes of a verified sketch."""
        record = self.get_sketch(sketch_id)
        with open(record.filepath, "rb") as f:
            return f.read()


# Singleton instance
image_service = ImageService()
