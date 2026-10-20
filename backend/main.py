from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern lifespan context manager replacing deprecated startup/shutdown events."""
    settings.get_upload_dir()
    logger.info(
        f"Started {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]"
    )
    logger.info(f"CORS origins configured: {settings.CORS_ORIGINS}")
    logger.info(f"Active VLM provider: {settings.VLM_PROVIDER}")
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


# Create FastAPI application instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Sketch2Screen AI (S2S ux) Backend - Converts hand-drawn UI sketches into production React interfaces.",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
)

# Strict CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Safe global exception handlers
register_exception_handlers(app)

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
