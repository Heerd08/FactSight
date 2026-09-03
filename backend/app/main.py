"""
FactSight Backend — FastAPI Application Entry Point (Pure RAG Architecture)

AI-Powered Misinformation Detection and Credibility Assessment System.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.db import init_db
from app.rag.vector_store import get_vector_store
from app.rag.ingestion import seed_vector_store
from app.api.routes import health, analyze, feedback, reports

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler — runs on startup and shutdown."""
    # Startup
    logger.info("=" * 60)
    logger.info("FactSight Backend Starting (Pure RAG Mode)...")
    logger.info("=" * 60)

    # 1. Initialize Database 1 (Application DB)
    logger.info("Initializing Application Database (Database 1)...")
    init_db()
    logger.info("Application Database initialized.")

    # 2. Initialize Database 2 (Vector DB for RAG)
    logger.info("Initializing Vector Database (Database 2)...")
    try:
        vector_store = get_vector_store()
        vector_store.initialize()
        if vector_store.count() == 0:
            logger.info("Vector store is empty. Seeding initial fact-checking corpus...")
            seed_vector_store()
        logger.info(f"Vector Database ready with {vector_store.count()} indexed fact-checks.")
    except Exception as e:
        logger.warning(f"Vector DB startup warning: {e}")

    logger.info("=" * 60)
    logger.info(f"FactSight Pure RAG Backend Ready at http://{settings.HOST}:{settings.PORT}")
    logger.info(f"API Docs: http://{settings.HOST}:{settings.PORT}/docs")
    logger.info("=" * 60)

    yield

    # Shutdown
    logger.info("FactSight Backend shutting down...")


# Create FastAPI app
app = FastAPI(
    title="FactSight API (Pure RAG)",
    description=(
        "AI-Powered Misinformation Detection and Credibility Assessment System.\n\n"
        "- **Database 1**: Application Database (Users, History, Reports, Feedback, Audit Logs)\n"
        "- **Database 2**: Vector Database (RAG Fact-Checking Knowledge Base)\n"
        "- **Architecture**: Pure RAG with ChromaDB & dense cosine vector search"
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(reports.router, prefix="/api")


@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint — redirects to docs."""
    return {
        "message": "FactSight API — Pure RAG Misinformation Detection System",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/api/health",
        "analyze": "/api/analyze",
        "feedback": "/api/feedback",
        "reports": "/api/reports",
    }
