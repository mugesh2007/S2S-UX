from fastapi import APIRouter
from app.api.v1.endpoints import health, projects, sketches

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(sketches.router, tags=["Sketches"])
api_router.include_router(projects.router, tags=["Projects"])
