from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def check_health():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "ai_provider": settings.AI_PROVIDER,
        "database": "connected (sqlite)"
    }
