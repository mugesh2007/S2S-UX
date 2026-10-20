import io
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from PIL import Image

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from main import app


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


@pytest.fixture
def sample_png_bytes() -> bytes:
    """Generates a valid 200x200 PNG test image in memory."""
    buf = io.BytesIO()
    img = Image.new("RGB", (200, 200), color=(11, 17, 32))
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.fixture
def sample_jpeg_bytes() -> bytes:
    """Generates a valid 300x200 JPEG test image in memory."""
    buf = io.BytesIO()
    img = Image.new("RGB", (300, 200), color=(255, 255, 255))
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture
def sample_webp_bytes() -> bytes:
    """Generates a valid 250x250 WebP test image in memory."""
    buf = io.BytesIO()
    img = Image.new("RGB", (250, 250), color=(30, 40, 60))
    img.save(buf, format="WEBP")
    return buf.getvalue()


@pytest.fixture
def corrupted_image_bytes() -> bytes:
    """Corrupted bytes masquerading as image."""
    return b"NOT_A_REAL_IMAGE_DATA_STREAM"


@pytest.fixture
def tiny_image_bytes() -> bytes:
    """Image violating the minimum 64x64 dimension rule (e.g. 16x16)."""
    buf = io.BytesIO()
    img = Image.new("RGB", (16, 16), color=(0, 0, 0))
    img.save(buf, format="PNG")
    return buf.getvalue()
