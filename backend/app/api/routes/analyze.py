"""
Analysis endpoint — POST /api/analyze (Pure RAG Multi-Modal Mode)

Accepts any of the 6 modalities:
1. Copy-Paste Plain Text
2. Web Article / URL
3. Screenshot Image / OCR
4. Browser Extension Submissions
5. Forwarded Email Verification
6. Social Media Posts
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.schemas.analysis import AnalyzeRequest, AnalyzeResponse, ErrorResponse
from app.services.analysis_service import get_analysis_service
from app.rag.vector_store import get_vector_store
from app.database.db import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze Content (Multi-Modal)",
    description=(
        "Analyze a claim, news URL, screenshot asset, email, or social post. "
        "Returns Pure RAG classification, credibility score, and verified source citations."
    ),
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input"},
        503: {"model": ErrorResponse, "description": "Vector store not loaded"},
    },
    tags=["Analysis"],
)
async def analyze_content(
    request: AnalyzeRequest,
    raw_request: Request,
    db: Session = Depends(get_db),
):
    """Analyze multi-modal content for misinformation using Pure RAG."""
    # Validate that at least text, url, or image was provided
    input_text = (request.text or "").strip()
    input_url = (request.url or "").strip()

    if not input_text and not input_url and not request.image_base64:
        raise HTTPException(
            status_code=400,
            detail="Must provide either 'text', 'url', or 'image_base64' for analysis.",
        )

    # Check Vector Database is initialized
    vector_store = get_vector_store()
    if not vector_store.is_initialized:
        try:
            vector_store.initialize()
        except Exception as e:
            logger.error(f"Failed to initialize Vector Store: {e}")
            raise HTTPException(
                status_code=503,
                detail="Vector database is not loaded. The server is still initializing.",
            )

    client_ip = raw_request.client.host if raw_request.client else None

    try:
        analysis_service = get_analysis_service()
        result = analysis_service.analyze(
            text=input_text,
            url=input_url,
            content_type=request.content_type,
            sender=request.sender,
            image_base64=request.image_base64,
            db=db,
            client_ip=client_ip,
        )
        return result
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}",
        )
