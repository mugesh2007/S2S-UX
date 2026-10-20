from fastapi import APIRouter, File, UploadFile, status
from app.core.exceptions import ImageValidationError
from app.schemas.sketch import (
    PreprocessStrategy,
    SketchAnalysisRequest,
    SketchAnalysisResponse,
    SketchUploadResponse,
)
from app.services.cv_preprocessor import cv_preprocessor
from app.services.image_service import image_service

router = APIRouter()


@router.post(
    "/sketches/upload",
    response_model=SketchUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Hand-Drawn Sketch",
)
async def upload_sketch(file: UploadFile = File(...)):
    """
    Securely uploads and validates a hand-drawn sketch image (JPEG, PNG, WebP).
    Verifies actual binary content, checks dimensions, and generates safe internal file storage.
    """
    if not file:
        raise ImageValidationError("No image file provided in upload request.")

    content = await file.read()
    response = image_service.store_sketch(
        content=content,
        original_filename=file.filename,
    )
    return response


@router.post(
    "/sketches/{sketch_id}/analyze",
    response_model=SketchAnalysisResponse,
    summary="Analyze Sketch Contours & Preprocessing",
)
def analyze_sketch(
    sketch_id: str,
    payload: SketchAnalysisRequest = SketchAnalysisRequest(),
):
    """
    Applies the requested computer vision preprocessing strategy (CLAHE, Bilateral, Otsu, None)
    and extracts visual element bounding boxes and contour coordinates.
    """
    image_bytes = image_service.read_sketch_bytes(sketch_id)
    return cv_preprocessor.analyze_sketch(
        sketch_id=sketch_id,
        image_bytes=image_bytes,
        strategy=payload.strategy,
        user_annotations=payload.user_annotations,
    )
