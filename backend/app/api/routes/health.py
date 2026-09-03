"""
Health check endpoint.
"""

from fastapi import APIRouter

from app.api.schemas.analysis import HealthResponse
from app.rag.vector_store import get_vector_store
from app.rag.embeddings import get_embedding_service

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Check if the API, RAG Engine, and Vector DB are running.",
    tags=["System"],
)
async def health_check():
    """Returns the health status of the API and Vector DB."""
    vector_store = get_vector_store()
    if not vector_store.is_initialized:
        try:
            vector_store.initialize()
        except Exception:
            pass

    doc_count = 0
    try:
        doc_count = vector_store.count()
    except Exception:
        pass

    embedding_service = get_embedding_service()

    return HealthResponse(
        status="ok",
        model_loaded=vector_store.is_initialized,
        model_version=f"pure-rag-{embedding_service.model_name}",
        vector_db_loaded=vector_store.is_initialized,
        vector_db_documents=doc_count,
    )
