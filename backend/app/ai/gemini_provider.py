import base64
import json
import re
from typing import List, Optional
import httpx
from PIL import Image

from app.ai.base import IVLMProvider
from app.ai.prompt_templates import SYSTEM_PROMPT, build_user_prompt
from app.core.config import settings
from app.core.exceptions import AIProviderError, InterfaceValidationError
from app.core.logging import logger
from app.schemas.interface import InterfaceDocument


class GeminiVLMProvider(IVLMProvider):
    """
    Google Gemini Multimodal Vision-Language Model Provider.
    Calls the Gemini API (defaulting to gemini-3.8-flash or configured model)
    with strict structured JSON output and comprehensive error handling.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        timeout_seconds: float = 45.0,
    ):
        self.api_key = api_key or settings.GEMINI_API_KEY
        # Normalize model to current high-efficiency multimodal model (e.g. gemini-3.8-flash)
        raw_model = model_name or settings.GEMINI_MODEL or "gemini-3.8-flash"
        if raw_model.startswith("gemini-2.5") or raw_model.startswith("gemini-1.5"):
            logger.info(f"Normalizing deprecated model {raw_model} to gemini-3.8-flash")
            self.model_name = "gemini-3.8-flash"
        else:
            self.model_name = raw_model
        self.timeout_seconds = timeout_seconds

    def generate_interface(
        self,
        image_bytes: bytes,
        user_annotations: Optional[List[str]] = None,
        design_system: str = "modern-dark",
        title: Optional[str] = None,
    ) -> InterfaceDocument:
        """
        Executes multimodal visual interpretation using Gemini Vision API.
        """
        if not self.api_key:
            raise AIProviderError(
                message="Google Gemini API key is not configured. Set GEMINI_API_KEY in your environment or use the 'mock' provider.",
                code="MISSING_API_KEY",
                details={"retryable": False, "suggested_action": "Configure GEMINI_API_KEY in .env"},
            )

        if len(image_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
            max_mb = settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)
            raise AIProviderError(
                message=f"Uploaded sketch exceeds max allowable size of {max_mb:.1f} MB.",
                code="OVERSIZED_IMAGE",
                details={"retryable": False},
            )

        # Detect MIME type
        mime_type = "image/png"
        if image_bytes.startswith(b"\xff\xd8\xff"):
            mime_type = "image/jpeg"
        elif image_bytes.startswith(b"RIFF"):
            mime_type = "image/webp"

        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        user_prompt = build_user_prompt(
            user_annotations=user_annotations,
            design_system=design_system,
            title=title,
        )

        # Call Gemini REST API directly with httpx (ensures complete isolation & zero external SDK conflict)
        api_url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"
            f"?key={self.api_key}"
        )

        request_payload = {
            "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [
                {
                    "parts": [
                        {"inline_data": {"mime_type": mime_type, "data": base64_image}},
                        {"text": user_prompt},
                    ]
                }
            ],
            "generation_config": {
                "response_mime_type": "application/json",
                "temperature": 0.1,
            },
        }

        try:
            logger.info(f"Invoking Gemini VLM [{self.model_name}] for sketch interpretation...")
            with httpx.Client(timeout=self.timeout_seconds) as client:
                response = client.post(api_url, json=request_payload)

            if response.status_code == 429:
                raise AIProviderError(
                    message="Gemini API rate limit exceeded. Please wait a moment and retry.",
                    code="RATE_LIMIT_EXCEEDED",
                    details={"retryable": True, "status_code": 429},
                )

            if response.status_code == 400:
                error_body = response.json().get("error", {})
                raise AIProviderError(
                    message=f"Gemini API rejected request: {error_body.get('message', 'Bad Request')}",
                    code="INVALID_PROVIDER_REQUEST",
                    details={"retryable": False, "raw_error": error_body},
                )

            if response.status_code != 200:
                raise AIProviderError(
                    message=f"Gemini API returned unexpected status {response.status_code}.",
                    code="API_ERROR",
                    details={"retryable": True, "status_code": response.status_code},
                )

            res_json = response.json()
            candidates = res_json.get("candidates", [])
            if not candidates or "content" not in candidates[0]:
                raise AIProviderError(
                    message="Gemini returned an empty generation response.",
                    code="EMPTY_MODEL_OUTPUT",
                    details={"retryable": True},
                )

            raw_text = candidates[0]["content"]["parts"][0]["text"]
            return self._parse_and_validate_ast(raw_text, title=title, design_system=design_system)

        except httpx.TimeoutException:
            raise AIProviderError(
                message=f"Gemini API call timed out after {self.timeout_seconds} seconds. Please check your network and retry.",
                code="API_TIMEOUT",
                details={"retryable": True, "timeout_seconds": self.timeout_seconds},
            )
        except httpx.NetworkError as ne:
            raise AIProviderError(
                message=f"Network connection to Gemini API failed: {str(ne)}. Verify internet connectivity.",
                code="NETWORK_ERROR",
                details={"retryable": True},
            )
        except AIProviderError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error during Gemini VLM generation: {str(e)}", exc_info=True)
            raise AIProviderError(
                message=f"Vision model generation failed: {str(e)}",
                code="VLM_GENERATION_FAILED",
                details={"retryable": True},
            )

    def _parse_and_validate_ast(
        self, raw_json_str: str, title: Optional[str] = None, design_system: str = "modern-dark"
    ) -> InterfaceDocument:
        """Strips markdown fences, parses JSON, and validates via Pydantic InterfaceDocument."""
        cleaned = raw_json_str.strip()
        # Remove markdown ```json ``` wraps if returned
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned)
            cleaned = re.sub(r"\n?```$", "", cleaned)
            cleaned = cleaned.strip()

        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError as jde:
            logger.error(f"Failed to parse Gemini output as JSON: {raw_json_str[:300]}")
            raise AIProviderError(
                message="AI model produced malformed JSON output that could not be parsed.",
                code="MALFORMED_MODEL_OUTPUT",
                details={"retryable": True, "json_error": str(jde)},
            )

        try:
            doc = InterfaceDocument.model_validate(parsed)
            # Ensure metadata records real provider
            doc.meta.ai_provider = "gemini"
            doc.meta.model_used = self.model_name
            doc.meta.is_mock = False
            if title:
                doc.meta.title = title
            doc.meta.design_system = design_system
            return doc
        except Exception as ve:
            logger.error(f"Pydantic AST validation failed on model output: {str(ve)}")
            raise AIProviderError(
                message=f"Generated interface failed schema validation: {str(ve)}",
                code="SCHEMA_VALIDATION_ERROR",
                details={"retryable": True, "validation_error": str(ve)},
            )

    def health_check(self) -> dict:
        """Checks configuration readiness."""
        has_key = bool(self.api_key)
        return {
            "provider": "gemini",
            "model": self.model_name,
            "configured": has_key,
            "status": "ready" if has_key else "missing_api_key",
        }
