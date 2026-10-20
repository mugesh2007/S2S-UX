import json
from unittest.mock import MagicMock, patch
import httpx
import pytest
from app.ai.base import IVLMProvider
from app.ai.factory import VLMProviderFactory
from app.ai.gemini_provider import GeminiVLMProvider
from app.ai.mock_provider import MockVLMProvider
from app.core.exceptions import AIProviderError, InterfaceValidationError
from app.schemas.component import ComponentType
from app.schemas.interface import InterfaceDocument


def test_mock_provider_generation(sample_png_bytes):
    """Verifies that MockVLMProvider produces valid AST and marks is_mock=True."""
    provider = MockVLMProvider()
    doc = provider.generate_interface(
        image_bytes=sample_png_bytes,
        user_annotations=["Make button blue", "Sticky top navbar", "Is this a card?"],
        title="Test Screen",
    )

    assert isinstance(doc, InterfaceDocument)
    assert doc.id == "root-container"
    assert doc.type == ComponentType.CONTAINER
    assert doc.meta.title == "Test Screen"
    assert doc.meta.is_mock is True
    assert doc.meta.ai_provider == "mock"

    # Verify annotation-aware proposals
    proposals = doc.meta.proposed_changes
    assert len(proposals) >= 2
    assert any(p.action_type == "style_change" for p in proposals)
    assert any(p.action_type == "layout_shift" for p in proposals)
    assert all(p.is_applied is False for p in proposals)  # Never silently applied

    # Verify uncertainty tracking
    assert len(doc.meta.uncertain_elements) >= 1


def test_factory_resolution():
    """Verifies factory resolves correct providers and rejects unsupported ones."""
    mock_prov = VLMProviderFactory.get_provider("mock")
    assert isinstance(mock_prov, MockVLMProvider)

    gemini_prov = VLMProviderFactory.get_provider("gemini")
    assert isinstance(gemini_prov, GeminiVLMProvider)

    with pytest.raises(AIProviderError) as exc_info:
        VLMProviderFactory.get_provider("unsupported_ai_vendor")
    assert exc_info.value.code == "INVALID_PROVIDER_CONFIG"


def test_gemini_missing_api_key(sample_png_bytes):
    """Verifies Gemini provider rejects calls if API key is missing."""
    provider = GeminiVLMProvider(api_key="")
    with pytest.raises(AIProviderError) as exc_info:
        provider.generate_interface(sample_png_bytes)

    assert exc_info.value.code == "MISSING_API_KEY"
    assert exc_info.value.details["retryable"] is False


def test_gemini_oversized_image():
    """Verifies rejection of oversized image payload."""
    provider = GeminiVLMProvider(api_key="valid-dummy-key")
    huge_bytes = b"0" * (11 * 1024 * 1024)  # 11 MB > 10 MB limit

    with pytest.raises(AIProviderError) as exc_info:
        provider.generate_interface(huge_bytes)

    assert exc_info.value.code == "OVERSIZED_IMAGE"


@patch("httpx.Client.post")
def test_gemini_successful_mocked_response(mock_post, sample_png_bytes):
    """Verifies Gemini provider parses valid JSON and populates real metadata."""
    valid_ast_json = {
        "id": "root-container",
        "type": "Container",
        "name": "Screen Root",
        "props": {"layout": "flex-col", "gap": "gap-4", "padding": "p-4"},
        "styles": {"tailwindClasses": "bg-slate-950 p-6"},
        "boundingBox": {"x": 0, "y": 0, "w": 1000, "h": 1000},
        "meta": {
            "title": "Synthesized Gemini Screen",
            "pageType": "dashboard",
            "designSystem": "modern-dark",
        },
        "children": [
            {
                "id": "btn-action",
                "type": "Button",
                "name": "Action Button",
                "props": {"label": "Click Me", "variant": "primary"},
                "boundingBox": {"x": 50, "y": 50, "w": 200, "h": 50},
                "textContent": "Click Me",
                "confidence": 0.95,
            }
        ],
    }

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {"text": json.dumps(valid_ast_json)}
                    ]
                }
            }
        ]
    }
    mock_post.return_value = mock_response

    provider = GeminiVLMProvider(api_key="valid-dummy-key", model_name="gemini-3.8-flash")
    doc = provider.generate_interface(sample_png_bytes, title="Synthesized Gemini Screen")

    assert doc.id == "root-container"
    assert doc.meta.ai_provider == "gemini"
    assert doc.meta.model_used == "gemini-3.8-flash"
    assert doc.meta.is_mock is False
    assert len(doc.children) == 1
    assert doc.children[0].type == ComponentType.BUTTON


@patch("httpx.Client.post")
def test_gemini_malformed_json_handling(mock_post, sample_png_bytes):
    """Verifies rejection and clear retryable error on malformed model JSON."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": "THIS IS NOT VALID JSON AT ALL {unclosed"}]
                }
            }
        ]
    }
    mock_post.return_value = mock_response

    provider = GeminiVLMProvider(api_key="valid-dummy-key")
    with pytest.raises(AIProviderError) as exc_info:
        provider.generate_interface(sample_png_bytes)

    assert exc_info.value.code == "MALFORMED_MODEL_OUTPUT"
    assert exc_info.value.details["retryable"] is True


@patch("httpx.Client.post")
def test_gemini_unknown_component_type_rejection(mock_post, sample_png_bytes):
    """Verifies rejection of arbitrary or unallowed component types injected by model."""
    invalid_ast = {
        "id": "root-container",
        "type": "Container",
        "children": [
            {
                "id": "arbitrary-node",
                "type": "ArbitraryInjectedWidget",  # Not in allowlist!
                "props": {},
            }
        ],
    }

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": json.dumps(invalid_ast)}]
                }
            }
        ]
    }
    mock_post.return_value = mock_response

    provider = GeminiVLMProvider(api_key="valid-dummy-key")
    with pytest.raises(AIProviderError) as exc_info:
        provider.generate_interface(sample_png_bytes)

    assert exc_info.value.code == "SCHEMA_VALIDATION_ERROR"
    assert exc_info.value.details["retryable"] is True


@patch("httpx.Client.post")
def test_gemini_rate_limit_handling(mock_post, sample_png_bytes):
    """Verifies handling of HTTP 429 rate limits."""
    mock_response = MagicMock()
    mock_response.status_code = 429
    mock_post.return_value = mock_response

    provider = GeminiVLMProvider(api_key="valid-dummy-key")
    with pytest.raises(AIProviderError) as exc_info:
        provider.generate_interface(sample_png_bytes)

    assert exc_info.value.code == "RATE_LIMIT_EXCEEDED"
    assert exc_info.value.details["retryable"] is True


@patch("httpx.Client.post")
def test_gemini_timeout_handling(mock_post, sample_png_bytes):
    """Verifies handling of network timeouts."""
    mock_post.side_effect = httpx.TimeoutException("Read timed out")

    provider = GeminiVLMProvider(api_key="valid-dummy-key", timeout_seconds=1.0)
    with pytest.raises(AIProviderError) as exc_info:
        provider.generate_interface(sample_png_bytes)

    assert exc_info.value.code == "API_TIMEOUT"
    assert exc_info.value.details["retryable"] is True


@patch("httpx.Client.post")
def test_gemini_missing_fields_rejection(mock_post, sample_png_bytes):
    """Verifies rejection when model output lacks mandatory schema fields."""
    incomplete_ast = {
        # Missing root "id" and "type"
        "name": "Invalid Root",
        "children": [],
    }

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": json.dumps(incomplete_ast)}]
                }
            }
        ]
    }
    mock_post.return_value = mock_response

    provider = GeminiVLMProvider(api_key="valid-dummy-key")
    with pytest.raises(AIProviderError) as exc_info:
        provider.generate_interface(sample_png_bytes)

    assert exc_info.value.code == "SCHEMA_VALIDATION_ERROR"
    assert exc_info.value.details["retryable"] is True


@patch("httpx.Client.post")
def test_gemini_network_error_handling(mock_post, sample_png_bytes):
    """Verifies handling of network connectivity errors."""
    mock_post.side_effect = httpx.NetworkError("Connection refused")

    provider = GeminiVLMProvider(api_key="valid-dummy-key")
    with pytest.raises(AIProviderError) as exc_info:
        provider.generate_interface(sample_png_bytes)

    assert exc_info.value.code == "NETWORK_ERROR"
    assert exc_info.value.details["retryable"] is True


def test_cv_analysis_image_pipeline(sample_png_bytes):
    """Verifies CV preprocessor creates normalized analysis version for VLM."""
    from app.services.cv_preprocessor import cv_preprocessor
    from PIL import Image
    import io

    analysis_bytes = cv_preprocessor.prepare_vision_analysis_image(sample_png_bytes, target_max_dim=800)
    assert len(analysis_bytes) > 0

    img = Image.open(io.BytesIO(analysis_bytes))
    assert img.mode == "RGB"
    assert max(img.size) <= 800

