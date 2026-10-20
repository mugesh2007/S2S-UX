from datetime import datetime, timezone
from fastapi import APIRouter
from app.ai.factory import VLMProviderFactory
from app.core.config import settings

router = APIRouter()
START_TIME = datetime.now(timezone.utc)


@router.get("/health", summary="Service Health and Status")
def get_health():
    """Returns application health, version, active AI provider, and system uptime."""
    uptime_seconds = round((datetime.now(timezone.utc) - START_TIME).total_seconds(), 2)
    provider_info = VLMProviderFactory.get_provider().health_check()

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "active_vlm_provider": settings.VLM_PROVIDER,
        "ai_provider_info": provider_info,
        "uptime_seconds": uptime_seconds,
        "max_upload_size_mb": round(settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024), 1),
    }
