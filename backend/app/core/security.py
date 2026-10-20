import io
import os
import uuid
from pathlib import Path
from typing import Tuple
from PIL import Image, UnidentifiedImageError

from app.core.config import settings
from app.core.exceptions import ImageValidationError
from app.core.logging import logger

# Magic number signatures
MAGIC_NUMBERS = {
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/webp": [b"RIFF"],  # Followed by WEBP at offset 8
}

ALLOWED_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def sanitize_and_validate_path(target_path: Path, base_dir: Path) -> Path:
    """
    Prevents path traversal attacks by resolving real paths and ensuring
    the target resides strictly within the allowed base directory.
    """
    try:
        resolved_base = base_dir.resolve()
        resolved_target = target_path.resolve()
        if not str(resolved_target).startswith(str(resolved_base)):
            raise ImageValidationError("Invalid file path: path traversal detected.")
        return resolved_target
    except Exception as e:
        raise ImageValidationError(f"Path validation failed: {str(e)}")


def validate_image_bytes(content: bytes) -> Tuple[str, int, int]:
    """
    Thoroughly validates uploaded file bytes for:
    1. Size limit.
    2. Magic number header match.
    3. Pillow image integrity and format verification.
    4. Minimum and maximum dimensions.

    Returns:
        Tuple of (mime_type: str, width: int, height: int)
    """
    # 1. Size check
    if len(content) == 0:
        raise ImageValidationError("Uploaded file is empty (0 bytes).")

    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        max_mb = settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)
        raise ImageValidationError(
            f"File size exceeds maximum allowable limit of {max_mb:.1f} MB."
        )

    # 2. Magic byte check
    detected_mime = None
    for mime, signatures in MAGIC_NUMBERS.items():
        for sig in signatures:
            if content.startswith(sig):
                if mime == "image/webp":
                    # Extra check for WEBP chunk header
                    if len(content) >= 12 and content[8:12] == b"WEBP":
                        detected_mime = mime
                        break
                else:
                    detected_mime = mime
                    break
        if detected_mime:
            break

    if not detected_mime or detected_mime not in settings.ALLOWED_IMAGE_TYPES:
        raise ImageValidationError(
            f"Unsupported or corrupted file format. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}."
        )

    # 3. Pillow structural integrity check
    try:
        image_stream = io.BytesIO(content)
        with Image.open(image_stream) as img:
            # Verify file format
            img.verify()
            format_name = img.format.lower() if img.format else ""

            # Check format match
            expected_format = {
                "image/jpeg": "jpeg",
                "image/png": "png",
                "image/webp": "webp",
            }.get(detected_mime)

            if format_name != expected_format:
                raise ImageValidationError(
                    f"Image header ({detected_mime}) contradicts verified internal format ({format_name})."
                )

        # Reopen to read dimensions safely (verify() clears some internal fields)
        with Image.open(io.BytesIO(content)) as img:
            width, height = img.size

            if width < settings.MIN_IMAGE_DIMENSION or height < settings.MIN_IMAGE_DIMENSION:
                raise ImageValidationError(
                    f"Image dimensions ({width}x{height}) are too small. Minimum required: {settings.MIN_IMAGE_DIMENSION}x{settings.MIN_IMAGE_DIMENSION}."
                )

            if width > settings.MAX_IMAGE_DIMENSION or height > settings.MAX_IMAGE_DIMENSION:
                raise ImageValidationError(
                    f"Image dimensions ({width}x{height}) exceed maximum allowed of {settings.MAX_IMAGE_DIMENSION}x{settings.MAX_IMAGE_DIMENSION}."
                )

            return detected_mime, width, height

    except UnidentifiedImageError:
        raise ImageValidationError("File is not a valid or recognizable image.")
    except Exception as e:
        if isinstance(e, ImageValidationError):
            raise
        logger.warning(f"Image integrity verification failed: {str(e)}")
        raise ImageValidationError("Image file is corrupted or could not be decoded.")


def generate_secure_filename(mime_type: str) -> str:
    """Generates an unguessable UUID-based filename with verified extension."""
    ext = ALLOWED_EXTENSIONS.get(mime_type, ".png")
    return f"{uuid.uuid4().hex}{ext}"
