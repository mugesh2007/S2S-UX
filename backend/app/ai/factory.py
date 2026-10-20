from typing import Optional
from app.ai.base import IVLMProvider
from app.ai.gemini_provider import GeminiVLMProvider
from app.ai.mock_provider import MockVLMProvider
from app.core.config import settings
from app.core.exceptions import AIProviderError
from app.core.logging import logger


class VLMProviderFactory:
    """Factory creating and resolving Vision-Language Model provider instances."""

    @staticmethod
    def get_provider(provider_type: Optional[str] = None) -> IVLMProvider:
        active_type = (provider_type or settings.VLM_PROVIDER).lower()

        if active_type == "gemini":
            logger.info("Initializing Google Gemini VLM Provider")
            return GeminiVLMProvider()
        elif active_type == "mock":
            logger.info("Initializing Deterministic Mock VLM Provider")
            return MockVLMProvider()
        else:
            raise AIProviderError(
                message=f"Unsupported VLM provider '{active_type}'. Supported providers: 'mock', 'gemini'.",
                code="INVALID_PROVIDER_CONFIG",
                details={"supported_providers": ["mock", "gemini"], "requested_provider": active_type},
            )


# Provide easy helper
def get_default_vlm_provider() -> IVLMProvider:
    return VLMProviderFactory.get_provider()
